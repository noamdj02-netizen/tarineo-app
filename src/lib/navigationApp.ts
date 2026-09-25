/**
 * Navigation sidebar / hub mobile — source unique des libellés et hrefs.
 *
 * Architecture produit (4 piliers) :
 * 1. Accueil — synthèse dépenses, fournisseurs, import rapide
 * 2. Analyses — marge sur les achats (hausses, tendances)
 * 3. Document distributeur — import IA, devis/factures/bons fournisseurs
 * 4. Ventes clients — devis, factures et carnet clients (id interne : entreprise)
 *
 * Fournisseurs = suivi par enseigne (BFA) sur l’axe achats.
 * Import → analyses-en-cours → classement distributeur | ventes clients (voir pipelineImportArtisan).
 *
 * Routes hors menu (pages conservées, pas de lien sidebar / hub mobile) :
 * - `/facturation-clients` — facturation électronique (bientôt)
 * - `/chantiers` — marge par chantier (bientôt)
 * - `/depenses` — redirect vers `/accueil` ; export compta : `/depenses/export`
 */
import { ROUTES_DOCUMENTS_PAR_TYPE } from "@/lib/documentLabels";
import type { NavBadges } from "@/lib/navBadges";

/** Titres des deux axes sidebar / hub mobile (achats fournisseurs vs vente clients). */
export const LIBELLE_SECTION_DOCUMENT_DISTRIBUTEUR = "Document distributeur";
export const LIBELLE_SECTION_DOCUMENT_ENTREPRISE = "Ventes clients";
export const SOUS_TITRE_SECTION_DISTRIBUTEUR =
  "Devis, factures et bons chez vos distributeurs (Cedeo, Point P, Rexel…)";
export const SOUS_TITRE_SECTION_ENTREPRISE = "Devis clients, factures et facturation pour vos clients";

export type LienSousMenu = { href: string; libelle: string };

export type LienNavPrincipale = {
  id: string;
  href: string;
  libelle: string;
};

export type RaccourciNav = {
  href: string;
  libelle: string;
  cle: keyof NavBadges;
};

export type SectionNavSidebar = {
  /** En-tête style Navpit (`// … //`). Omis pour la dernière section sans titre. */
  libelleSection?: string;
  lienIds: string[];
};

export const SOUS_LIENS_DISTRIBUTEUR: LienSousMenu[] = [
  { href: "/documents", libelle: "Tous" },
  { href: "/coffre", libelle: "Mon coffre" },
  { href: ROUTES_DOCUMENTS_PAR_TYPE.DEVIS, libelle: "Devis" },
  { href: ROUTES_DOCUMENTS_PAR_TYPE.BON_COMMANDE, libelle: "Bons de commande" },
  { href: ROUTES_DOCUMENTS_PAR_TYPE.BON_ENLEVEMENT, libelle: "Bons d'enlèvement" },
  { href: ROUTES_DOCUMENTS_PAR_TYPE.FACTURE, libelle: "Factures" },
];

export const SOUS_LIENS_ENTREPRISE: LienSousMenu[] = [
  { href: "/devis-clients", libelle: "Devis clients" },
  { href: "/factures-clients", libelle: "Factures clients" },
  { href: "/clients", libelle: "Clients" },
];

export const RACCOURCIS_DISTRIBUTEUR: RaccourciNav[] = [
  { href: "/documents?hausse=1", libelle: "Hausses détectées", cle: "hausses" },
  { href: "/documents?verifier=1", libelle: "À vérifier", cle: "aVerifier" },
];

/** Ordre sidebar : Accueil → Analyses → achats distributeur → ventes clients → Fournisseurs → Paramètres. */
export const LIENS_NAV_PRINCIPALE: LienNavPrincipale[] = [
  { id: "dashboard", href: "/accueil", libelle: "Accueil" },
  { id: "analyses", href: "/analyses", libelle: "Analyses" },
  { id: "distributeur", href: "/documents", libelle: LIBELLE_SECTION_DOCUMENT_DISTRIBUTEUR },
  { id: "entreprise", href: "/devis-clients", libelle: LIBELLE_SECTION_DOCUMENT_ENTREPRISE },
  { id: "fournisseurs", href: "/fournisseurs", libelle: "Fournisseurs" },
  { id: "parametres", href: "/parametres", libelle: "Paramètres" },
];

/** Groupes sidebar desktop (structure Navpit, ordre des séparateurs). */
export const SECTIONS_NAV_SIDEBAR: SectionNavSidebar[] = [
  { libelleSection: "Pilotage", lienIds: ["dashboard", "analyses"] },
  { libelleSection: "Achats fournisseurs", lienIds: ["distributeur"] },
  { libelleSection: "Vente clients", lienIds: ["entreprise"] },
  { lienIds: ["fournisseurs", "parametres"] },
];

export function lienNavParId(id: string): LienNavPrincipale | undefined {
  return LIENS_NAV_PRINCIPALE.find((l) => l.id === id);
}

export function lienSidebarActif(pathname: string, href: string): boolean {
  const base = href.split("?")[0];
  if (base === "/documents" && href === "/documents") {
    return pathname === "/documents";
  }
  if (pathname === base) return true;
  if (base.startsWith("/documents/")) return pathname === base;
  if (base === "/devis-clients") {
    return pathname === "/devis-clients" || pathname.startsWith("/devis-clients/");
  }
  if (base !== "/accueil") return pathname.startsWith(`${base}/`);
  return false;
}

export function sectionDistributeurActive(pathname: string): boolean {
  return SOUS_LIENS_DISTRIBUTEUR.some((l) => lienSidebarActif(pathname, l.href));
}

export function sectionEntrepriseActive(pathname: string): boolean {
  return SOUS_LIENS_ENTREPRISE.some((l) => lienSidebarActif(pathname, l.href));
}
