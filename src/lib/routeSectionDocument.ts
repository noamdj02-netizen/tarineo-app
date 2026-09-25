import type { DocumentType } from "@prisma/client";
import { ROUTES_DOCUMENTS_PAR_TYPE } from "@/lib/documentLabels";

/** Liste sidebar / page dédiée pour un document distributeur classé par l'IA. */
export function routeSectionDocumentDistributeur(type: DocumentType): string {
  return ROUTES_DOCUMENTS_PAR_TYPE[type];
}

export function estDomaineEntreprise(rawExtraction: unknown): boolean {
  if (!rawExtraction || typeof rawExtraction !== "object") return false;
  return (rawExtraction as { domaine?: string }).domaine === "entreprise";
}
