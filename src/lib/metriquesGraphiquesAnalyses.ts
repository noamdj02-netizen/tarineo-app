import { prisma } from "@/lib/prisma";
import { TYPES_ACHAT_REEL } from "@/lib/documentLabels";
import { filtreDocumentsDistributeur } from "@/lib/filtreDocumentsDistributeur";
import { filtreDocumentHorsBrouillon } from "@/lib/filtreBrouillonDocument";
import { parserPayloadsAlertesHausse } from "@/lib/comparaisonPrix";
import { normaliserDistributeur } from "@/lib/normalisation";
import type { PeriodeAnalyses } from "@/lib/analysesPage";

const JOURS_COURTS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function ajouterMoisUTC(date: Date, mois: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + mois, 1));
}

function debutJourUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function montantDepuisPayloads(
  payloads: ReturnType<typeof parserPayloadsAlertesHausse>,
  lignes: { documentId: string; reference: string; quantity: unknown }[],
) {
  const quantiteParCle = new Map(lignes.map((l) => [`${l.documentId}::${l.reference}`, Number(l.quantity)]));
  return payloads.reduce((somme, p) => {
    const quantite = quantiteParCle.get(`${p.documentId}::${p.reference}`) ?? 1;
    return somme + (p.ecartEuros ?? 0) * quantite;
  }, 0);
}

export type MetriquesGraphiquesAnalyses = {
  evolutionDepenses: { mois: string; montant: number }[];
  aDesDepenses: boolean;
  repartitionHaussesParDistributeur: { distributorNorm: string; distributor: string; count: number }[];
  totalSemaine: number;
  evolutionPct: number | null;
  donneesSemaine: { jour: string; montant: number }[];
};

/** Graphiques retirés de l'accueil — chargés uniquement sur /analyses. */
export async function chargerMetriquesGraphiquesAnalyses(
  userId: string,
  periodeMois: PeriodeAnalyses,
): Promise<MetriquesGraphiquesAnalyses> {
  const maintenant = new Date();
  const debutPeriode = new Date(
    Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth() - (periodeMois - 1), 1),
  );
  const debut12Mois = ajouterMoisUTC(maintenant, -11);

  const debutSemaine = (() => {
    const jour = maintenant.getUTCDay();
    const deltaLundi = jour === 0 ? -6 : 1 - jour;
    return debutJourUTC(
      new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), maintenant.getUTCDate() + deltaLundi)),
    );
  })();
  const debutSemainePrecedente = new Date(debutSemaine.getTime() - 7 * 86400000);

  const moisDepenses = Math.min(periodeMois, 6);
  const debutDepenses = ajouterMoisUTC(maintenant, -(moisDepenses - 1));

  const [documentsDepenses, alertes12Mois] = await Promise.all([
    prisma.document.findMany({
      where: {
        userId,
        ...filtreDocumentsDistributeur,
        ...filtreDocumentHorsBrouillon,
        type: { in: [...TYPES_ACHAT_REEL] },
        status: "VALIDATED",
        documentDate: { gte: debutDepenses },
      },
      select: { documentDate: true, totalHt: true },
    }),
    prisma.alert.findMany({
      where: { userId, type: "PRICE_INCREASE", createdAt: { gte: debut12Mois } },
    }),
  ]);

  const depensesParMois = new Map<string, number>();
  for (let i = -(moisDepenses - 1); i <= 0; i++) {
    const d = ajouterMoisUTC(maintenant, i);
    depensesParMois.set(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`, 0);
  }
  for (const doc of documentsDepenses) {
    if (!doc.documentDate) continue;
    const cle = `${doc.documentDate.getUTCFullYear()}-${String(doc.documentDate.getUTCMonth() + 1).padStart(2, "0")}`;
    if (depensesParMois.has(cle)) {
      depensesParMois.set(cle, (depensesParMois.get(cle) ?? 0) + Number(doc.totalHt ?? 0));
    }
  }
  const evolutionDepenses = [...depensesParMois.entries()].map(([mois, montant]) => ({ mois, montant }));
  const aDesDepenses = evolutionDepenses.some((d) => d.montant > 0);

  const alertesPeriode = alertes12Mois.filter((a) => a.createdAt >= debutPeriode);
  const compteParDistributeur = new Map<string, { distributor: string; count: number }>();
  for (const p of parserPayloadsAlertesHausse(alertesPeriode)) {
    const norm = normaliserDistributeur(p.distributor);
    const existant = compteParDistributeur.get(norm);
    if (existant) existant.count += 1;
    else compteParDistributeur.set(norm, { distributor: p.distributor, count: 1 });
  }
  const repartitionHaussesParDistributeur = [...compteParDistributeur.entries()]
    .map(([distributorNorm, v]) => ({ distributorNorm, distributor: v.distributor, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const alertesSemaine = alertes12Mois.filter((a) => a.createdAt >= debutSemaine);
  const alertesSemainePrecedente = alertes12Mois.filter(
    (a) => a.createdAt >= debutSemainePrecedente && a.createdAt < debutSemaine,
  );

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
      alertesSemaine.filter((a) => a.createdAt >= jourDate && a.createdAt < jourFin),
    );
    const docIdsJour = [...new Set(payloadsJour.map((p) => p.documentId))];
    const montant =
      docIdsJour.length === 0
        ? 0
        : montantDepuisPayloads(
            payloadsJour,
            lignesSemaine.filter((l) => docIdsJour.includes(l.documentId)),
          );
    return { jour: JOURS_COURTS[jourDate.getUTCDay()], montant };
  });

  return {
    evolutionDepenses,
    aDesDepenses,
    repartitionHaussesParDistributeur,
    totalSemaine,
    evolutionPct,
    donneesSemaine,
  };
}
