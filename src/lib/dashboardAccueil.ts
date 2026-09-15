import { prisma } from "@/lib/prisma";
import { debutMoisUTC } from "@/lib/quota";
import { TYPES_ACHAT_REEL } from "@/lib/documentLabels";
import { calculerDepensesParDistributeur } from "@/lib/depenses";
import { normaliserDistributeur } from "@/lib/normalisation";
import { parserPayloadsAlertesHausse } from "@/lib/comparaisonPrix";
import { DEMO_DASHBOARD } from "@/lib/uiDemo";
import type { DocumentRecent, FournisseurCarte } from "@/app/(app)/accueil/DashboardSections";

const JOURS_COURTS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

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

function estVide(donnees: {
  nbDocumentsMois: number;
  fournisseursTop: FournisseurCarte[];
  documentsRecentsUi: DocumentRecent[];
  repartitionParDistributeur: { count: number }[];
  aDesDepenses: boolean;
}) {
  return (
    donnees.nbDocumentsMois === 0 &&
    donnees.fournisseursTop.length === 0 &&
    donnees.documentsRecentsUi.length === 0 &&
    donnees.repartitionParDistributeur.length === 0 &&
    !donnees.aDesDepenses
  );
}

export type DonneesDashboardAccueil = {
  nbDocumentsMois: number;
  pourcentageMoyenHausse: number | null;
  montantIdentifie: number;
  payloadsCount: number;
  fournisseursTop: FournisseurCarte[];
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
  utiliseDemo: boolean;
};

export async function chargerDonneesDashboardAccueil(userId: string): Promise<DonneesDashboardAccueil> {
  const maintenant = new Date();
  const debutMois = debutMoisUTC(maintenant);
  const moisCourantStr = `${maintenant.getUTCFullYear()}-${String(maintenant.getUTCMonth() + 1).padStart(2, "0")}`;

  const vide: DonneesDashboardAccueil = {
    nbDocumentsMois: 0,
    pourcentageMoyenHausse: null,
    montantIdentifie: 0,
    payloadsCount: 0,
    fournisseursTop: [],
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
    utiliseDemo: false,
  };

  try {
    const [nbDocumentsMois, alertesCeMois, alertes12Mois] = await Promise.all([
      prisma.document.count({ where: { userId, createdAt: { gte: debutMois } } }),
      prisma.alert.findMany({
        where: { userId, type: "PRICE_INCREASE", createdAt: { gte: debutMois } },
      }),
      prisma.alert.findMany({
        where: { userId, type: "PRICE_INCREASE", createdAt: { gte: ajouterMoisUTC(maintenant, -11) } },
      }),
    ]);

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

    const documentsRecents = await prisma.document.findMany({
      where: {
        userId,
        type: { in: [...TYPES_ACHAT_REEL] },
        status: "VALIDATED",
        documentDate: { gte: ajouterMoisUTC(maintenant, -5) },
      },
      select: { documentDate: true, totalHt: true },
    });
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

    const debutSemaine = (() => {
      const jour = maintenant.getUTCDay();
      const deltaLundi = jour === 0 ? -6 : 1 - jour;
      return debutJourUTC(new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), maintenant.getUTCDate() + deltaLundi)));
    })();

    const [docsSemaine, alertesSemaine, alertesSemainePrecedente] = await Promise.all([
      prisma.document.findMany({
        where: { userId, createdAt: { gte: debutSemaine } },
        orderBy: [{ documentDate: "desc" }, { createdAt: "desc" }],
        take: 6,
        select: { id: true, distributor: true, documentDate: true, totalHt: true },
      }),
      prisma.alert.findMany({
        where: { userId, type: "PRICE_INCREASE", createdAt: { gte: debutSemaine } },
      }),
      prisma.alert.findMany({
        where: {
          userId,
          type: "PRICE_INCREASE",
          createdAt: {
            gte: new Date(debutSemaine.getTime() - 7 * 86400000),
            lt: debutSemaine,
          },
        },
      }),
    ]);

    const docIdsSemaine = new Set(docsSemaine.map((d) => d.id));
    const alertesParDoc = new Map<string, number>();
    if (docIdsSemaine.size > 0) {
      const alertesDocs = await prisma.alert.findMany({
        where: { userId, type: "PRICE_INCREASE" },
      });
      for (const p of parserPayloadsAlertesHausse(alertesDocs)) {
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
      return {
        id: doc.id,
        distributor: doc.distributor ?? "Fournisseur",
        documentDate: doc.documentDate,
        totalHt: doc.totalHt !== null ? Number(doc.totalHt) : null,
        hausseLabel,
        haussePositive: pct !== undefined && pct > 3,
        hausseNegative: pct !== undefined && pct < -3,
      };
    });

    const payloadsSemaine = parserPayloadsAlertesHausse(alertesSemaine);
    const docIdsAlertesSemaine = [...new Set(payloadsSemaine.map((p) => p.documentId))];
    const lignesSemaine =
      docIdsAlertesSemaine.length > 0
        ? await prisma.lineItem.findMany({
            where: { documentId: { in: docIdsAlertesSemaine } },
            select: { documentId: true, reference: true, quantity: true },
          })
        : [];
    const totalSemaine = montantDepuisPayloads(payloadsSemaine, lignesSemaine);

    const payloadsSemainePrec = parserPayloadsAlertesHausse(alertesSemainePrecedente);
    const docIdsPrec = [...new Set(payloadsSemainePrec.map((p) => p.documentId))];
    const lignesPrec =
      docIdsPrec.length > 0
        ? await prisma.lineItem.findMany({
            where: { documentId: { in: docIdsPrec } },
            select: { documentId: true, reference: true, quantity: true },
          })
        : [];
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

    const depenses = await calculerDepensesParDistributeur(userId);
    const fournisseursTop = [...depenses]
      .sort((a, b) => b.depenses - a.depenses)
      .slice(0, 3)
      .map((d) => ({
        distributor: d.distributor,
        distributorNorm: d.distributorNorm,
        depenses: d.depenses,
        pourcentageAtteinte: d.pourcentageAtteinte,
        objectif: d.objectif,
      }));

    const distributeursExistants = await prisma.document.findMany({
      where: { userId, distributorNorm: { not: null } },
      select: { distributor: true, distributorNorm: true },
      orderBy: { documentDate: "desc" },
    });
    const distributeursOptions = new Map<string, string>();
    for (const d of distributeursExistants) {
      if (d.distributorNorm && !distributeursOptions.has(d.distributorNorm)) {
        distributeursOptions.set(d.distributorNorm, d.distributor ?? d.distributorNorm);
      }
    }

    const donnees: DonneesDashboardAccueil = {
      nbDocumentsMois,
      pourcentageMoyenHausse,
      montantIdentifie,
      payloadsCount: payloadsCeMois.length,
      fournisseursTop,
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
      utiliseDemo: false,
    };

    if (estVide(donnees)) {
      return appliquerDemo(donnees);
    }
    return donnees;
  } catch {
    return appliquerDemo(vide);
  }
}

function appliquerDemo(base: DonneesDashboardAccueil): DonneesDashboardAccueil {
  return {
    ...base,
    nbDocumentsMois: DEMO_DASHBOARD.nbDocumentsMois,
    pourcentageMoyenHausse: DEMO_DASHBOARD.hausseMoyenne,
    montantIdentifie: DEMO_DASHBOARD.economiesPotentielles,
    payloadsCount: DEMO_DASHBOARD.payloadsCount,
    fournisseursTop: DEMO_DASHBOARD.fournisseurs,
    documentsRecentsUi: DEMO_DASHBOARD.documentsRecents,
    totalSemaine: DEMO_DASHBOARD.totalSemaine,
    evolutionPct: DEMO_DASHBOARD.evolutionPct,
    donneesSemaine: DEMO_DASHBOARD.donneesSemaine,
    evolutionDepenses: DEMO_DASHBOARD.evolutionDepenses,
    aDesDepenses: true,
    repartitionParDistributeur: DEMO_DASHBOARD.repartitionParDistributeur,
    utiliseDemo: true,
  };
}
