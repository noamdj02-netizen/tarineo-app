import type { Prisma } from "@prisma/client";

/** Documents utilisables pour « Mes fournisseurs » (négoce matériaux uniquement). */
export const filtreDocumentsSuiviFournisseur: Prisma.DocumentWhereInput = {
  NOT: {
    rawExtraction: {
      path: ["emetteur_est_negoce_materiaux"],
      equals: false,
    },
  },
};

/** Scans routés vers l'espace « documents entreprise » — hors listes distributeur / analyses achats. */
export const filtreDocumentsDistributeur: Prisma.DocumentWhereInput = {
  NOT: {
    rawExtraction: {
      path: ["domaine"],
      equals: "entreprise",
    },
  },
};

export function whereDocumentsDistributeur(
  userId: string,
  extra?: Prisma.DocumentWhereInput,
): Prisma.DocumentWhereInput {
  return {
    userId,
    ...filtreDocumentsDistributeur,
    ...extra,
  };
}

export type CibleEntrepriseImport = {
  type: "devis_client" | "facture_client";
  id: string;
};

export function lireCibleEntreprise(rawExtraction: unknown): CibleEntrepriseImport | null {
  if (!rawExtraction || typeof rawExtraction !== "object") return null;
  const cible = (rawExtraction as { cibleEntreprise?: CibleEntrepriseImport }).cibleEntreprise;
  if (!cible?.id || (cible.type !== "devis_client" && cible.type !== "facture_client")) return null;
  return cible;
}
