/**
 * Pipeline produit : Compte → Import → Analyse IA → Dashboard
 *
 *   inscription / connexion
 *     → upload (Supabase + Document PROCESSING)
 *     → extraction.ts (Claude, domaine distributeur | entreprise)
 *     → distributeur : type + enseigne → sections Devis/Factures/Bons + Fournisseurs/Analyses
 *     → entreprise : devis/facture client → Ventes clients
 */
import type { DocumentStatus, DocumentType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { lireCibleEntreprise } from "@/lib/filtreDocumentsDistributeur";
import { estDomaineEntreprise, routeSectionDocumentDistributeur } from "@/lib/routeSectionDocument";

export type DomaineDocument = "distributeur" | "entreprise";

export type DestinationApresAnalyse = {
  domaine: DomaineDocument;
  /** Redirection client après analyse terminée (VALIDATED / NEEDS_REVIEW). */
  redirectTo?: string;
  /** Section sidebar pour un document distributeur (rétrocompat API). */
  sectionHref?: string;
  libelleDestination?: string;
};

export function lireDomaineDocument(rawExtraction: unknown): DomaineDocument {
  return estDomaineEntreprise(rawExtraction) ? "entreprise" : "distributeur";
}

export function analyseTermineePourNavigation(status: DocumentStatus): boolean {
  return status === "VALIDATED" || status === "NEEDS_REVIEW";
}

/** Où envoyer l'artisan une fois l'IA terminée (poll /api/documents/[id]/statut). */
export function resoudreDestinationApresAnalyse(input: {
  status: DocumentStatus;
  type: DocumentType;
  rawExtraction: unknown;
}): DestinationApresAnalyse {
  const domaine = lireDomaineDocument(input.rawExtraction);

  if (!analyseTermineePourNavigation(input.status)) {
    return { domaine };
  }

  if (domaine === "entreprise") {
    const cible = lireCibleEntreprise(input.rawExtraction);
    const redirectTo =
      cible?.type === "facture_client"
        ? `/factures-clients/${cible.id}`
        : cible?.type === "devis_client"
          ? `/devis-clients/${cible.id}`
          : "/devis-clients";
    return {
      domaine,
      redirectTo,
      libelleDestination: "Ventes clients",
    };
  }

  const sectionHref = routeSectionDocumentDistributeur(input.type);
  return {
    domaine,
    redirectTo: sectionHref,
    sectionHref,
    libelleDestination: "Document distributeur",
  };
}

/** Rafraîchit les pages du dashboard concernées par le classement IA. */
export function revaliderTableauDeBordApresClassification(
  domaine: DomaineDocument,
  typeDocument?: DocumentType,
): void {
  revalidatePath("/accueil");
  revalidatePath("/documents");

  if (domaine === "distributeur") {
    revalidatePath("/fournisseurs");
    revalidatePath("/analyses");
    revalidatePath("/coffre");
    if (typeDocument) {
      revalidatePath(routeSectionDocumentDistributeur(typeDocument));
    }
    return;
  }

  revalidatePath("/devis-clients");
  revalidatePath("/factures-clients");
  revalidatePath("/facturation-clients");
  revalidatePath("/clients");
}
