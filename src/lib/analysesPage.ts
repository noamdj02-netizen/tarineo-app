import { prisma } from "@/lib/prisma";
import { parserPayloadsAlertesHausse } from "@/lib/comparaisonPrix";
import { TYPES_ACHAT_REEL } from "@/lib/documentLabels";
import { filtreDocumentsDistributeur } from "@/lib/filtreDocumentsDistributeur";
import { filtreDocumentHorsBrouillon } from "@/lib/filtreBrouillonDocument";
import { listerFournisseursUtilisateur, couleurDonutFournisseur } from "@/lib/fournisseursPage";

export type PeriodeAnalyses = 3 | 6 | 12;

export interface TrancheDepense {
  nom: string;
  pct: number;
  montant: number;
  couleur: string;
}

export interface LigneHausseAnalyse {
  produit: string;
  fournisseur: string;
  haussePct: number;
  categorie: string;
  date: string;
  prixAvant: number | null;
  prixActuel: number;
  documentId: string;
}

export interface SerieEvolutionPrix {
  nom: string;
  couleur: string;
  points: { mois: string; label: string; variationPct: number }[];
}

export interface ProduitRecent {
  designation: string;
  reference: string;
  fournisseur: string;
  quantite: number;
  prixUnitaire: number;
  totalHt: number;
  date: string;
  documentId: string;
  variationPct: number | null;
}

const MOIS_COURTS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

function debutPeriode(mois: PeriodeAnalyses, maintenant = new Date()): Date {
  return new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth() - (mois - 1), 1));
}

function cleMois(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function labelMoisCourt(cle: string): string {
  const [, m] = cle.split("-").map(Number);
  return MOIS_COURTS[m - 1] ?? cle;
}

function impactEurosSurPeriode(
  alertes: { payload: import("@prisma/client").Prisma.JsonValue }[],
  lignes: { documentId: string; reference: string; quantity: unknown }[],
): number {
  const payloads = parserPayloadsAlertesHausse(alertes);
  const quantiteParCle = new Map(lignes.map((l) => [`${l.documentId}::${l.reference}`, Number(l.quantity)]));
  const total = payloads.reduce((somme, p) => {
    const quantite = quantiteParCle.get(`${p.documentId}::${p.reference}`) ?? 1;
    return somme + (p.ecartEuros ?? 0) * quantite;
  }, 0);
  return Math.round(total * 100) / 100;
}

/** Catégorie approximative à partir de la désignation produit. */
export function infererCategorieProduit(designation: string): string {
  const t = designation.toLowerCase();
  if (/disjoncteur|câble|cable|électri|electri|prise|gaine|tableau/.test(t)) return "Électricité";
  if (/carrel|faïence|faience|colle|joint/.test(t)) return "Carrelage";
  if (/chauffe|tube|cuivre|robinet|plomb|sanitaire|wc|vasque|radiateur/.test(t)) return "Plomberie";
  if (/peinture|enduit|plaque|isolant|laine|placo/.test(t)) return "Second œuvre";
  return "Matériel";
}

function calculerEvolutionPrix(
  historique: { distributor: string; distributorNorm: string; unitPriceHt: unknown; documentDate: Date }[],
  mois: PeriodeAnalyses,
): SerieEvolutionPrix[] {
  const debut = debutPeriode(mois);
  const moisCles: string[] = [];
  for (let i = 0; i < mois; i++) {
    const d = new Date(Date.UTC(debut.getUTCFullYear(), debut.getUTCMonth() + i, 1));
    if (d <= new Date()) moisCles.push(cleMois(d));
  }

  const parDist = new Map<string, { nom: string; parMois: Map<string, number[]> }>();
  for (const h of historique) {
    const norm = h.distributorNorm || h.distributor;
    if (!parDist.has(norm)) {
      parDist.set(norm, { nom: h.distributor, parMois: new Map() });
    }
    const cle = cleMois(h.documentDate);
    if (!moisCles.includes(cle)) continue;
    const bucket = parDist.get(norm)!.parMois;
    if (!bucket.has(cle)) bucket.set(cle, []);
    bucket.get(cle)!.push(Number(h.unitPriceHt));
  }

  const top = [...parDist.entries()]
    .map(([norm, data]) => ({
      norm,
      nom: data.nom,
      total: [...data.parMois.values()].reduce((s, arr) => s + arr.length, 0),
      parMois: data.parMois,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return top.map((dist, index) => {
    const moyennes = moisCles.map((cle) => {
      const prix = dist.parMois.get(cle);
      if (!prix || prix.length === 0) return null;
      return prix.reduce((s, p) => s + p, 0) / prix.length;
    });

    const base = moyennes.find((v) => v !== null && v > 0) ?? null;

    const points = moisCles.map((cle, i) => {
      const moy = moyennes[i];
      const variationPct =
        base && moy !== null && base > 0 ? Math.round(((moy - base) / base) * 100) : 0;
      return { mois: cle, label: labelMoisCourt(cle), variationPct };
    });

    return {
      nom: dist.nom,
      couleur: couleurDonutFournisseur(index),
      points,
    };
  });
}

async function chargerProduitsRecents(userId: string, debut: Date): Promise<ProduitRecent[]> {
  const lignes = await prisma.lineItem.findMany({
    where: {
      userId,
      document: {
        type: { in: [...TYPES_ACHAT_REEL] },
        status: "VALIDATED",
        documentDate: { gte: debut },
      },
    },
    select: {
      designation: true,
      reference: true,
      referenceNorm: true,
      quantity: true,
      unitPriceHt: true,
      totalHt: true,
      document: {
        select: { id: true, distributor: true, documentDate: true, distributorNorm: true },
      },
    },
    orderBy: { document: { documentDate: "desc" } },
    take: 40,
  });

  const refs = [...new Set(lignes.map((l) => l.referenceNorm))];
  const historiqueParCle = new Map<string, number[]>();
  if (refs.length > 0) {
    const historique = await prisma.priceHistory.findMany({
      where: { userId, referenceNorm: { in: refs } },
      orderBy: { documentDate: "desc" },
      select: { referenceNorm: true, distributorNorm: true, unitPriceHt: true },
    });
    for (const h of historique) {
      const cle = `${h.referenceNorm}::${h.distributorNorm ?? ""}`;
      if (!historiqueParCle.has(cle)) historiqueParCle.set(cle, []);
      historiqueParCle.get(cle)!.push(Number(h.unitPriceHt));
    }
  }

  const vus = new Set<string>();
  const resultats: ProduitRecent[] = [];

  for (const l of lignes) {
    const cle = `${l.referenceNorm}::${l.document.distributorNorm ?? l.document.distributor}`;
    if (vus.has(cle)) continue;
    vus.add(cle);

    const cleHist = `${l.referenceNorm}::${l.document.distributorNorm ?? ""}`;
    const prixHist = historiqueParCle.get(cleHist) ?? [];

    const prixActuel = Number(l.unitPriceHt);
    const prixPrecedent = prixHist.length > 1 ? prixHist[1] : null;
    const variationPct =
      prixPrecedent && prixPrecedent > 0
        ? Math.round(((prixActuel - prixPrecedent) / prixPrecedent) * 100)
        : null;

    const dateDoc = l.document.documentDate;
    resultats.push({
      designation: l.designation,
      reference: l.reference,
      fournisseur: l.document.distributor ?? "—",
      quantite: Number(l.quantity),
      prixUnitaire: prixActuel,
      totalHt: Number(l.totalHt),
      date: dateDoc
        ? dateDoc.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
        : "—",
      documentId: l.document.id,
      variationPct,
    });

    if (resultats.length >= 10) break;
  }

  return resultats;
}

export async function chargerDonneesAnalyses(userId: string, periodeMois: PeriodeAnalyses = 6) {
  const debut = debutPeriode(periodeMois);

  const [fournisseurs, alertes, historiquePrix, produitsRecents, nbHaussesActives, nbAVerifier] =
    await Promise.all([
    listerFournisseursUtilisateur(userId),
    prisma.alert.findMany({
      where: {
        userId,
        type: "PRICE_INCREASE",
        createdAt: { gte: debut },
      },
      orderBy: { createdAt: "desc" },
      take: 80,
      select: { payload: true, createdAt: true },
    }),
    prisma.priceHistory.findMany({
      where: { userId, documentDate: { gte: debut } },
      select: {
        distributor: true,
        distributorNorm: true,
        unitPriceHt: true,
        documentDate: true,
      },
      orderBy: { documentDate: "asc" },
    }),
    chargerProduitsRecents(userId, debut),
    prisma.alert.count({
      where: { userId, type: "PRICE_INCREASE", seenAt: null },
    }),
    prisma.document.count({
      where: {
        userId,
        status: "NEEDS_REVIEW",
        ...filtreDocumentsDistributeur,
        ...filtreDocumentHorsBrouillon,
      },
    }),
  ]);

  const alertesParseesPeriode = parserPayloadsAlertesHausse(alertes);
  const documentIdsAlertes = [...new Set(alertesParseesPeriode.map((p) => p.documentId))];
  const lignesAlertes =
    documentIdsAlertes.length > 0
      ? await prisma.lineItem.findMany({
          where: { documentId: { in: documentIdsAlertes } },
          select: { documentId: true, reference: true, quantity: true },
        })
      : [];
  const impactHaussesEuros = impactEurosSurPeriode(alertes, lignesAlertes);
  const nbHaussesPeriode = alertesParseesPeriode.filter((p) => (p.ecartPourcent ?? 0) > 0).length;

  const totalDepenses = fournisseurs.reduce((s, f) => s + f.depenses, 0);

  const tranches: TrancheDepense[] = fournisseurs
    .filter((f) => f.depenses > 0)
    .map((f, i) => ({
      nom: f.nom,
      montant: f.depenses,
      pct: totalDepenses > 0 ? Math.round((f.depenses / totalDepenses) * 100) : 0,
      couleur: couleurDonutFournisseur(i),
    }));

  const alertesParsees = parserPayloadsAlertesHausse(alertes);
  const dateParCle = new Map<string, Date>();
  for (const a of alertes) {
    const p = parserPayloadsAlertesHausse([a])[0];
    if (p) dateParCle.set(`${p.documentId}::${p.reference}`, a.createdAt);
  }

  const hausses: LigneHausseAnalyse[] = alertesParsees
    .filter((p) => p.ecartPourcent !== null && p.ecartPourcent > 0)
    .sort((a, b) => (b.ecartPourcent ?? 0) - (a.ecartPourcent ?? 0))
    .slice(0, 5)
    .map((p) => {
      const dateAlerte = dateParCle.get(`${p.documentId}::${p.reference}`) ?? new Date();
      return {
        produit: p.designation,
        fournisseur: p.distributor,
        haussePct: Math.round(p.ecartPourcent ?? 0),
        categorie: infererCategorieProduit(p.designation),
        date: dateAlerte.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
        prixAvant: p.dernierPrix,
        prixActuel: p.prixActuel,
        documentId: p.documentId,
      };
    });

  const evolutionPrix = calculerEvolutionPrix(historiquePrix, periodeMois);

  return {
    tranches,
    totalDepenses,
    hausses,
    evolutionPrix,
    produitsRecents,
    periodeMois,
    impactHaussesEuros,
    nbHaussesPeriode,
    nbHaussesActives,
    nbAVerifier,
    aDesDonnees: totalDepenses > 0 || hausses.length > 0 || produitsRecents.length > 0,
  };
}
