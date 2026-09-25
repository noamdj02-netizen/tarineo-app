import type { DocumentType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parserPayloadsAlertesHausse } from "@/lib/comparaisonPrix";
import { filtreDocumentsDistributeur } from "@/lib/filtreDocumentsDistributeur";
import { filtreDocumentHorsBrouillon } from "@/lib/filtreBrouillonDocument";

export type RepartitionDistributeur = {
  norm: string;
  label: string;
  count: number;
};

export type StatsDocuments = {
  total: number;
  sommeHt: number;
  hausses: number;
  enseignes: number;
  parDistributeur: RepartitionDistributeur[];
};

export type CarteEnBref = {
  label: string;
  valeur: string;
  hint?: string;
  accent?: boolean;
};

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(valeur);

export async function chargerStatsDocuments(
  userId: string,
  options: {
    type?: DocumentType;
    distributeursOptions: Map<string, string>;
    maintenant?: Date;
  }
): Promise<StatsDocuments> {
  const maintenant = options.maintenant ?? new Date();
  const where: Prisma.DocumentWhereInput = options.type
    ? { userId, type: options.type, ...filtreDocumentsDistributeur, ...filtreDocumentHorsBrouillon }
    : { userId, ...filtreDocumentsDistributeur, ...filtreDocumentHorsBrouillon };

  const total = await prisma.document.count({ where });
  if (total === 0) {
    return { total: 0, sommeHt: 0, hausses: 0, enseignes: 0, parDistributeur: [] };
  }

  const [montant, parDistributeur, idsDocuments] = await Promise.all([
    prisma.document.aggregate({ where, _sum: { totalHt: true } }),
    prisma.document.groupBy({
      by: ["distributorNorm"],
      where: { ...where, distributorNorm: { not: null } },
      _count: { _all: true },
    }),
    prisma.document.findMany({ where, select: { id: true } }),
  ]);

  const idsDocumentsType = new Set(idsDocuments.map((d) => d.id));
  const alertesHausse12Mois = await prisma.alert.findMany({
    where: {
      userId,
      type: "PRICE_INCREASE",
      createdAt: { gte: new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth() - 11, 1)) },
    },
    select: { payload: true },
  });
  const hausses = parserPayloadsAlertesHausse(alertesHausse12Mois).filter((p) =>
    idsDocumentsType.has(p.documentId)
  ).length;

  const repartition = parDistributeur
    .map((d) => ({
      norm: d.distributorNorm as string,
      label: options.distributeursOptions.get(d.distributorNorm as string) ?? (d.distributorNorm as string),
      count: d._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    total,
    sommeHt: Number(montant._sum.totalHt ?? 0),
    hausses,
    enseignes: repartition.length,
    parDistributeur: repartition,
  };
}

export function cartesEnBrefParType(stats: StatsDocuments, type?: DocumentType): CarteEnBref[] {
  const labelDocuments =
    type === "BON_COMMANDE"
      ? "Bons"
      : type === "BON_ENLEVEMENT"
        ? "Bons"
        : "Documents";

  const cartes: CarteEnBref[] = [
    { label: labelDocuments, valeur: String(stats.total) },
    { label: "Montant HT", valeur: formaterEuros(stats.sommeHt) },
  ];

  if (type === "DEVIS") {
    cartes.push({ label: "Enseignes", valeur: String(stats.enseignes) });
    return cartes;
  }

  if (type === "BON_COMMANDE" || type === "BON_ENLEVEMENT") {
    cartes.push({ label: "Enseignes", valeur: String(stats.enseignes) });
    return cartes;
  }

  cartes.push({
    label: "Hausses",
    valeur: String(stats.hausses),
    accent: stats.hausses > 0,
    hint: stats.hausses > 0 ? "12 derniers mois" : undefined,
  });
  cartes.push({ label: "Enseignes", valeur: String(stats.enseignes) });
  return cartes;
}
