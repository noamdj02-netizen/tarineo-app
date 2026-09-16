import type { DocumentType } from "@prisma/client";

export const LABELS_STATUT: Record<string, string> = {
  PROCESSING: "En traitement",
  NEEDS_REVIEW: "À vérifier",
  VALIDATED: "Validé",
  ERROR: "Erreur",
};

export const LABELS_TYPE: Record<string, string> = {
  DEVIS: "Devis",
  FACTURE: "Facture",
  BON_COMMANDE: "Bon de commande",
  BON_ENLEVEMENT: "Bon d'enlèvement",
};

// Libellés au pluriel — sous-menu de la sidebar (AppShell.tsx) et onglets mobile
// (documents/NavTypeMobile.tsx), où chaque lien désigne une catégorie plutôt qu'un
// document précis ("Factures" plutôt que "Facture").
export const LABELS_TYPE_PLURIEL: Record<string, string> = {
  DEVIS: "Devis",
  FACTURE: "Factures",
  BON_COMMANDE: "Bons de commande",
  BON_ENLEVEMENT: "Bons d'enlèvement",
};

// Les 4 types filtrables sur /documents, dans l'ordre d'affichage partagé par le
// dropdown de filtre (documents/page.tsx), le sous-menu desktop (AppShell.tsx) et les
// onglets mobile (documents/NavTypeMobile.tsx).
export const TYPES_FILTRABLES = [
  "DEVIS",
  "FACTURE",
  "BON_COMMANDE",
  "BON_ENLEVEMENT",
] as const satisfies readonly DocumentType[];

/** Titres de page /documents selon le filtre type actif. */
export const TITRES_PAGE_DOCUMENTS: Record<"tous" | DocumentType, string> = {
  tous: "Mes documents",
  DEVIS: "Devis fournisseurs",
  FACTURE: "Factures fournisseurs",
  BON_COMMANDE: "Bons de commande",
  BON_ENLEVEMENT: "Bons d'enlèvement",
};

export const SOUS_TITRES_PAGE_DOCUMENTS: Record<"tous" | DocumentType, string> = {
  tous: "Importez et analysez vos devis, factures et bons fournisseur (PDF, photo, 20 Mo max).",
  DEVIS: "Propositions de prix reçues de vos distributeurs — base de comparaison pour détecter les hausses.",
  FACTURE: "Factures d'achat validées — alimentent votre historique de prix et vos dépenses.",
  BON_COMMANDE: "Bons de commande engagés chez vos fournisseurs.",
  BON_ENLEVEMENT: "Bons d'enlèvement et retraits en agence.",
};

/** Libellé zone photo — adapté au filtre actif ou générique sur « Mes documents ». */
export const LIBELLE_UPLOAD_PHOTO: Record<"tous" | DocumentType, string> = {
  tous: "Photographiez votre document",
  DEVIS: "Photographiez votre devis",
  FACTURE: "Photographiez votre facture",
  BON_COMMANDE: "Photographiez votre bon de commande",
  BON_ENLEVEMENT: "Photographiez votre bon d'enlèvement",
};

export const SOUS_LIBELLE_UPLOAD_PHOTO =
  "Devis, facture, bon de commande… l'IA détecte le type automatiquement.";

// Types représentant un achat réellement engagé, à utiliser pour le futur suivi de
// dépenses par distributeur. DEVIS est volontairement exclu : une proposition de prix
// n'est pas un achat (elle reste utile uniquement pour la détection de hausse de prix).
export const TYPES_ACHAT_REEL: readonly DocumentType[] = ["FACTURE", "BON_COMMANDE", "BON_ENLEVEMENT"];
