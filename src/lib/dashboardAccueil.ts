import { prisma } from "@/lib/prisma";
import { debutMoisUTC } from "@/lib/quota";
import { TYPES_ACHAT_REEL } from "@/lib/documentLabels";
import { calculerDepensesParDistributeur } from "@/lib/depenses";
import { normaliserDistributeur } from "@/lib/normalisation";
import { parserPayloadsAlertesHausse } from "@/lib/comparaisonPrix";
import {
  chargerLogosFournisseursUtilisateur,
  resoudreLogoFournisseur,
} from "@/lib/logosFournisseursPersistants";
import type { DocumentRecent, FournisseurCarte } from "@/app/(app)/accueil/DashboardSections";

const JOURS_COURTS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export type FournisseurASurveiller = {
  distributor: string;
  distributorNorm: string;
  logoUrl: string | null;
  pourcentageMoyen: number;
  nbReferences: number;
};

function ajouterMoisUTC(date: Date, mois: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + mois, 1));
}

function debutJourUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function montantDepuisPayloads(
  payloads: ReturnType<typeof parserPayloadsAlertesHausse>,
  lignes: { documentId: string; reference: string; quantity: unknown }[]
) {
  const quantiteParCle = new Map(lignes.map((l) => [`${l.documentId}::${l.reference}`, Number(l.quantity)]));
  return payloads.reduce((somme, p) => {
    const quantite = quantiteParCle.get(`${p.documentId}::${p.reference}`) ?? 1;
    return somme + (p.ecartEuros ?? 0) * quantite;
  }, 0);
}

export type DonneesDashboardAccueil = {
  nbDocumentsMois: number;
  pourcentageMoyenHausse: number | null;
  montantIdentifie: number;
  payloadsCount: number;
  fournisseursTop: FournisseurCarte[];
  aSurveiller: FournisseurASurveiller[];
  documentsRecentsUi: DocumentRecent[];
  totalSemaine: number;
  evolutionPct: number | null;
  donneesSemaine: { jour: string; montant: number }[];
  evolutionDepenses: { mois: string; montant: number }[];
  aDesDepenses: boolean;
  repartitionParDistributeur: { distributorNorm: string; distributor: string; count: number }[];
  depenses: Awaited<ReturnType<typeof calculerDepensesParDistributeur>>;
  distributeursOptions: Map<string, string>;
  moisCourantStr: string;
};

export async function chargerDonneesDashboardAccueil(userId: string): Promise<DonneesDashboardAccueil> {
  // BFA en arrière-plan — ne bloque plus le premier paint (évite le double calcul dépenses).
  void import("@/lib/alertesBfa")
    .then(({ synchroniserAlertesBfa }) => synchroniserAlertesBfa(userId))
    .catch((erreur) => {
      console.error("Synchronisation alertes BFA (dashboard) :", erreur);
    });

  const maintenant = new Date();
  const debutMois = debutMoisUTC(maintenant);
  const moisCourantStr = `${maintenant.getUTCFullYear()}-${String(maintenant.getUTCMonth() + 1).padStart(2, "0")}`;
  const debut12Mois = ajouterMoisUTC(maintenant, -11);

  const debutSemaine = (() => {
    const jour = maintenant.getUTCDay();
    const deltaLundi = jour === 0 ? -6 : 1 - jour;
    return debutJourUTC(
      new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), maintenant.getUTCDate() + deltaLundi))
    );
  })();
  const debutSemainePrecedente = new Date(debutSemaine.getTime() - 7 * 86400000);

  const vide: DonneesDashboardAccueil = {
    nbDocumentsMois: 0,
    pourcentageMoyenHausse: null,
    montantIdentifie: 0,
    payloadsCount: 0,
    fournisseursTop: [],
    aSurveiller: [],
    documentsRecentsUi: [],
    totalSemaine: 0,
    evolutionPct: null,
    donneesSemaine: Array.from({ length: 7 }, (_, i) => ({
      jour: JOURS_COURTS[(debutJourUTC(maintenant).getUTCDay() + i) % 7],
      montant: 0,
    })),
    evolutionDepenses: [],
    aDesDepenses: false,
    repartitionParDistributeur: [],
    depenses: [],
    distributeursOptions: new Map(),
    moisCourantStr,
  };

  try {
    const [nbDocumentsMois, alertes12Mois, documentsRecents, docsSemaine, depenses] = await Promise.all([
      prisma.document.count({ where: { userId, createdAt: { gte: debutMois } } }),
      prisma.alert.findMany({
        where: { userId, type: "PRICE_INCREASE", createdAt: { gte: debut12Mois } },
      }),
      prisma.document.findMany({
        where: {
          userId,
          type: { in: [...TYPES_ACHAT_REEL] },
          status: "VALIDATED",
          documentDate: { gte: ajouterMoisUTC(maintenant, -5) },
        },
        select: { documentDate: true, totalHt: true },
      }),
      prisma.document.findMany({
        where: { userId, createdAt: { gte: debutSemaine } },
        orderBy: [{ documentDate: "desc" }, { createdAt: "desc" }],
        take: 6,
        select: { id: true, distributor: true, distributorNorm: true, documentDate: true, totalHt: true, type: true },
      }),
      calculerDepensesParDistributeur(userId),
    ]);

    const normsLogos = [
      ...docsSemaine.map((d) => d.distributorNorm),
      ...depenses.map((d) => d.distributorNorm),
    ].filter((n): n is string => Boolean(n));
    const logosImportes = await chargerLogosFournisseursUtilisateur(userId, normsLogos);

    const alertesCeMois = alertes12Mois.filter((a) => a.createdAt >= debutMois);
    const alertesSemaine = alertes12Mois.filter((a) => a.createdAt >= debutSemaine);
    const alertesSemainePrecedente = alertes12Mois.filter(
      (a) => a.createdAt >= debutSemainePrecedente && a.createdAt < debutSemaine
    );

    const payloadsCeMois = parserPayloadsAlertesHausse(alertesCeMois);
    const pourcentageMoyenHausse =
      payloadsCeMois.length > 0
        ? payloadsCeMois.reduce((somme, p) => somme + (p.ecartPourcent ?? 0), 0) / payloadsCeMois.length
        : null;

    const documentIdsCeMois = [...new Set(payloadsCeMois.map((p) => p.documentId))];
    const lignesCeMois =
      documentIdsCeMois.length > 0
        ? await prisma.lineItem.findMany({
            where: { documentId: { in: documentIdsCeMois } },
            select: { documentId: true, reference: true, quantity: true },
          })
        : [];
    const montantIdentifie = montantDepuisPayloads(payloadsCeMois, lignesCeMois);

    const compteParDistributeur = new Map<string, { distributor: string; count: number }>();
    for (const p of parserPayloadsAlertesHausse(alertes12Mois)) {
      const norm = normaliserDistributeur(p.distributor);
      const existant = compteParDistributeur.get(norm);
      if (existant) existant.count += 1;
      else compteParDistributeur.set(norm, { distributor: p.distributor, count: 1 });
    }
    const repartitionParDistributeur = [...compteParDistributeur.entries()]
      .map(([distributorNorm, v]) => ({ distributorNorm, distributor: v.distributor, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const depensesParMois = new Map<string, number>();
    for (let i = -5; i <= 0; i++) {
      const d = ajouterMoisUTC(maintenant, i);
      depensesParMois.set(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`, 0);
    }
    for (const doc of documentsRecents) {
      if (!doc.documentDate) continue;
      const cle = `${doc.documentDate.getUTCFullYear()}-${String(doc.documentDate.getUTCMonth() + 1).padStart(2, "0")}`;
      if (depensesParMois.has(cle)) {
        depensesParMois.set(cle, (depensesParMois.get(cle) ?? 0) + Number(doc.totalHt ?? 0));
      }
    }
    const evolutionDepenses = [...depensesParMois.entries()].map(([mois, montant]) => ({ mois, montant }));
    const aDesDepenses = evolutionDepenses.some((d) => d.montant > 0);

    const docIdsSemaine = new Set(docsSemaine.map((d) => d.id));
    const alertesParDoc = new Map<string, number>();
    if (docIdsSemaine.size > 0) {
      for (const p of parserPayloadsAlertesHausse(alertes12Mois)) {
        if (!docIdsSemaine.has(p.documentId)) continue;
        const pctVal = p.ecartPourcent ?? 0;
        const actuel = alertesParDoc.get(p.documentId);
        if (actuel === undefined || Math.abs(pctVal) > Math.abs(actuel)) {
          alertesParDoc.set(p.documentId, pctVal);
        }
      }
    }

    const documentsRecentsUi = docsSemaine.map((doc) => {
      const pct = alertesParDoc.get(doc.id);
      let hausseLabel = "Stable";
      if (pct !== undefined) {
        if (pct > 3) hausseLabel = `+${pct.toFixed(0)}% hausse`;
        else if (pct < -3) hausseLabel = `${pct.toFixed(0)}% baisse`;
      }
      const distributor = doc.distributor ?? "Fournisseur";
      return {
        id: doc.id,
        type: doc.type,
        distributor,
        distributorNorm: doc.distributorNorm,
        logoUrl: resoudreLogoFournisseur(distributor, doc.distributorNorm, logosImportes),
        documentDate: doc.documentDate,
        totalHt: doc.totalHt !== null ? Number(doc.totalHt) : null,
        hausseLabel,
        haussePositive: pct !== undefined && pct > 3,
        hausseNegative: pct !== undefined && pct < -3,
      };
    });

    const payloadsSemaine = parserPayloadsAlertesHausse(alertesSemaine);
    const docIdsAlertesSemaine = [...new Set(payloadsSemaine.map((p) => p.documentId))];
    const payloadsSemainePrec = parserPayloadsAlertesHausse(alertesSemainePrecedente);
    const docIdsPrec = [...new Set(payloadsSemainePrec.map((p) => p.documentId))];
    const tousDocIds = [...new Set([...docIdsAlertesSemaine, ...docIdsPrec])];

    const lignesSemaineEtPrec =
      tousDocIds.length > 0
        ? await prisma.lineItem.findMany({
            where: { documentId: { in: tousDocIds } },
            select: { documentId: true, reference: true, quantity: true },
          })
        : [];

    const lignesSemaine = lignesSemaineEtPrec.filter((l) => docIdsAlertesSemaine.includes(l.documentId));
    const lignesPrec = lignesSemaineEtPrec.filter((l) => docIdsPrec.includes(l.documentId));

    const totalSemaine = montantDepuisPayloads(payloadsSemaine, lignesSemaine);
    const totalSemainePrec = montantDepuisPayloads(payloadsSemainePrec, lignesPrec);
    const evolutionPct =
      totalSemainePrec > 0 ? ((totalSemaine - totalSemainePrec) / totalSemainePrec) * 100 : totalSemaine > 0 ? 100 : null;

    const donneesSemaine = Array.from({ length: 7 }, (_, i) => {
      const jourDate = new Date(debutSemaine.getTime() + i * 86400000);
      const jourFin = new Date(jourDate.getTime() + 86400000);
      const payloadsJour = parserPayloadsAlertesHausse(
        alertesSemaine.filter((a) => a.createdAt >= jourDate && a.createdAt < jourFin)
      );
      const docIdsJour = [...new Set(payloadsJour.map((p) => p.documentId))];
      const montant =
        docIdsJour.length === 0
          ? 0
          : montantDepuisPayloads(
              payloadsJour,
              lignesSemaine.filter((l) => docIdsJour.includes(l.documentId))
            );
      return { jour: JOURS_COURTS[jourDate.getUTCDay()], montant };
    });

    const fournisseursTop = [...depenses]
      .sort((a, b) => b.depenses - a.depenses)
      .slice(0, 5)
      .map((d) => ({
        distributor: d.distributor,
        distributorNorm: d.distributorNorm,
        logoUrl: resoudreLogoFournisseur(d.distributor, d.distributorNorm, logosImportes),
        depenses: d.depenses,
        pourcentageAtteinte: d.pourcentageAtteinte,
        objectif: d.objectif,
      }));

    // Fournisseurs à surveiller : hausses récentes regroupées par enseigne.
    const haussesParEnseigne = new Map<
      string,
      { distributor: string; sommePct: number; refs: Set<string> }
    >();
    for (const p of payloadsCeMois) {
      if ((p.ecartPourcent ?? 0) <= 3) continue;
      const norm = normaliserDistributeur(p.distributor);
      const existant = haussesParEnseigne.get(norm);
      if (existant) {
        existant.sommePct += p.ecartPourcent ?? 0;
        existant.refs.add(p.reference);
      } else {
        haussesParEnseigne.set(norm, {
          distributor: p.distributor,
          sommePct: p.ecartPourcent ?? 0,
          refs: new Set([p.reference]),
        });
      }
    }
    const aSurveiller: FournisseurASurveiller[] = [...haussesParEnseigne.entries()]
      .map(([distributorNorm, v]) => ({
        distributor: v.distributor,
        distributorNorm,
        logoUrl: resoudreLogoFournisseur(v.distributor, distributorNorm, logosImportes),
        pourcentageMoyen: v.sommePct / v.refs.size,
        nbReferences: v.refs.size,
      }))
      .sort((a, b) => b.pourcentageMoyen - a.pourcentageMoyen)
      .slice(0, 4);

    const distributeursOptions = new Map(
      depenses.map((d) => [d.distributorNorm, d.distributor])
    );

    return {
      nbDocumentsMois,
      pourcentageMoyenHausse,
      montantIdentifie,
      payloadsCount: payloadsCeMois.length,
      fournisseursTop,
      aSurveiller,
      documentsRecentsUi,
      totalSemaine,
      evolutionPct,
      donneesSemaine,
      evolutionDepenses,
      aDesDepenses,
      repartitionParDistributeur,
      depenses,
      distributeursOptions,
      moisCourantStr,
    };
  } catch (e) {
    console.error("Échec du chargement du dashboard :", e);
    return vide;
  }
}
