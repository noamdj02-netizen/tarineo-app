/**
 * Navigation landing ↔ app SaaS (source unique).
 * Framer (www.tarineo.com) : préfixer hrefApp avec https://app.tarineo.com
 */

export type LienLanding = {
  id: string;
  label: string;
  /** Ancre sur la landing one-page */
  hrefLanding: string;
  /** Route dans l'app (relative si même origine) */
  hrefApp: string;
  description?: string;
};

/** Barre du haut — alignée sur les sections Framer + entrées produit */
export const NAV_LANDING_PRINCIPAL: LienLanding[] = [
  {
    id: "comment-ca-marche",
    label: "Comment ça marche",
    hrefLanding: "/comment-ca-marche",
    hrefApp: "/onboarding",
    description: "Premiers pas après inscription",
  },
  {
    id: "fonctionnalites",
    label: "Fonctionnalités",
    hrefLanding: "/fonctionnalites",
    hrefApp: "/documents",
    description: "Analyse IA des devis et factures",
  },
  {
    id: "tarifs",
    label: "Tarifs",
    hrefLanding: "/tarifs",
    hrefApp: "/compte",
    description: "Abonnement et facturation",
  },
  {
    id: "contact",
    label: "Contact",
    hrefLanding: "/contact",
    hrefApp: "mailto:contact@tarineo.com",
    description: "FAQ et support",
  },
];

/** Sous-menu « Fonctionnalités » → pages SaaS */
export const NAV_LANDING_PRODUIT: LienLanding[] = [
  {
    id: "accueil",
    label: "Tableau de bord",
    hrefLanding: "/fonctionnalites",
    hrefApp: "/accueil",
    description: "Dépenses, alertes et synthèse",
  },
  {
    id: "documents",
    label: "Mes documents",
    hrefLanding: "/fonctionnalites",
    hrefApp: "/documents",
    description: "Import et analyse des devis fournisseurs",
  },
  {
    id: "fournisseurs",
    label: "Fournisseurs",
    hrefLanding: "/fonctionnalites",
    hrefApp: "/fournisseurs",
    description: "Suivi par enseigne et objectifs BFA",
  },
  {
    id: "devis-clients",
    label: "Devis clients",
    hrefLanding: "/fonctionnalites",
    hrefApp: "/devis-clients",
    description: "Création et envoi de devis",
  },
  {
    id: "factures-clients",
    label: "Factures clients",
    hrefLanding: "/fonctionnalites",
    hrefApp: "/factures-clients",
    description: "Facturation après acceptation du devis",
  },
  {
    id: "parametres",
    label: "Paramètres",
    hrefLanding: "/fonctionnalites",
    hrefApp: "/parametres",
    description: "Profil, entreprise, notifications",
  },
];

export const NAV_LANDING_FOOTER_RAPIDES: LienLanding[] = [
  { id: "accueil", label: "Accueil", hrefLanding: "/", hrefApp: "/accueil" },
  { id: "blog", label: "À propos", hrefLanding: "/blog", hrefApp: "/blog" },
  {
    id: "fonctionnalites",
    label: "Fonctionnalités",
    hrefLanding: "/fonctionnalites",
    hrefApp: "/documents",
  },
  { id: "contact", label: "Contact", hrefLanding: "/contact", hrefApp: "mailto:contact@tarineo.com" },
];

export const NAV_LANDING_FOOTER_PRODUIT: LienLanding[] = [
  {
    id: "analyse-ia",
    label: "Analyse IA",
    hrefLanding: "/fonctionnalites",
    hrefApp: "/documents",
  },
  {
    id: "inscription",
    label: "Créer un compte",
    hrefLanding: "/inscription",
    hrefApp: "/inscription",
  },
  {
    id: "connexion",
    label: "Mon compte",
    hrefLanding: "/connexion",
    hrefApp: "/compte",
  },
  { id: "tarifs", label: "Tarifs", hrefLanding: "/tarifs", hrefApp: "/compte" },
];

/** URL absolue app pour liens depuis Framer (www → app) */
export function urlAppMarketing(): string {
  const auth = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (auth?.startsWith("http")) return auth.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") return "https://app.tarineo.com";
  return "http://localhost:3000";
}

export function lienAppAbsolu(chemin: string): string {
  if (chemin.startsWith("mailto:") || chemin.startsWith("http")) return chemin;
  const base = urlAppMarketing();
  return `${base}${chemin.startsWith("/") ? chemin : `/${chemin}`}`;
}
