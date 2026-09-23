import type { DocumentType } from "@prisma/client";
import { TYPES_FILTRABLES } from "@/lib/documentLabels";

/** Mappe ?type=devis|factures|DEVIS… vers l'enum Prisma. */
export function typeDepuisQuery(valeur: string | undefined): DocumentType | undefined {
  if (!valeur) return undefined;
  const normalise = valeur.trim().toLowerCase();
  const alias: Record<string, DocumentType> = {
    devis: "DEVIS",
    facture: "FACTURE",
    factures: "FACTURE",
    "bon-commande": "BON_COMMANDE",
    bon_commande: "BON_COMMANDE",
    "bons-de-commande": "BON_COMMANDE",
    "bon-enlevement": "BON_ENLEVEMENT",
    bon_enlevement: "BON_ENLEVEMENT",
    "bons-enlevement": "BON_ENLEVEMENT",
  };
  if (alias[normalise]) return alias[normalise];
  const maj = valeur.toUpperCase();
  if ((TYPES_FILTRABLES as readonly string[]).includes(maj)) {
    return maj as DocumentType;
  }
  return undefined;
}

/** Lien filtre simple sur /documents (V1). */
export function lienDocumentsType(type?: DocumentType): string {
  if (!type) return "/documents";
  if (type === "DEVIS") return "/documents?type=devis";
  if (type === "FACTURE") return "/documents?type=factures";
  if (type === "BON_COMMANDE") return "/documents?type=bon-commande";
  if (type === "BON_ENLEVEMENT") return "/documents?type=bon-enlevement";
  return "/documents";
}
