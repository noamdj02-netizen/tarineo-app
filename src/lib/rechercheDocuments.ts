import type { Prisma } from "@prisma/client";
import { normaliserDistributeur, normaliserReference } from "@/lib/normalisation";

/** Filtre large pour la barre de recherche globale (réf., désignation, fournisseur). */
export function filtreRechercheDocument(terme: string): Prisma.DocumentWhereInput {
  const brut = terme.trim();
  if (!brut) return {};

  const refNorm = normaliserReference(brut);
  const distNorm = normaliserDistributeur(brut);
  const distNormCompact = distNorm.replace(/\s/g, "");

  const conditions: Prisma.DocumentWhereInput[] = [
    { distributor: { contains: brut, mode: "insensitive" } },
    { lineItems: { some: { designation: { contains: brut, mode: "insensitive" } } } },
  ];

  if (refNorm.length >= 2) {
    conditions.push(
      { lineItems: { some: { referenceNorm: { contains: refNorm } } } },
      { lineItems: { some: { manufacturerRefNorm: { contains: refNorm } } } },
    );
  }

  if (distNorm.length >= 2) {
    conditions.push({ distributorNorm: { contains: distNorm } });
  }
  if (distNormCompact.length >= 2 && distNormCompact !== distNorm) {
    conditions.push({ distributorNorm: { contains: distNormCompact } });
  }

  return { OR: conditions };
}
