/** Pages statiques + écrans de détail (paths dynamiques résolus au runtime). */

export const STATIC_PAGES = [
  { slug: "accueil", label: "Accueil", path: "/accueil" },
  { slug: "documents", label: "Documents (liste)", path: "/documents" },
  { slug: "devis-fournisseurs", label: "Devis fournisseurs", path: "/documents/devis-fournisseurs" },
  { slug: "factures-fournisseurs", label: "Factures fournisseurs", path: "/documents/factures-fournisseurs" },
  { slug: "bons-commande", label: "Bons de commande", path: "/bons-de-commande" },
  { slug: "bons-enlevement", label: "Bons d'enlèvement", path: "/bons-enlevement" },
  { slug: "fournisseurs", label: "Fournisseurs (liste)", path: "/fournisseurs" },
  { slug: "analyses", label: "Analyses", path: "/analyses" },
  { slug: "devis-clients", label: "Devis clients (liste)", path: "/devis-clients" },
  { slug: "devis-nouveau", label: "Nouveau devis client", path: "/devis-clients/nouveau" },
  { slug: "factures-clients", label: "Factures clients", path: "/factures-clients" },
  { slug: "clients", label: "Clients (liste)", path: "/clients" },
  { slug: "facturation", label: "Facturation électronique", path: "/facturation-clients" },
  { slug: "chantiers", label: "Chantiers", path: "/chantiers" },
  { slug: "coffre", label: "Mon coffre", path: "/coffre" },
  { slug: "veille", label: "Veille prix", path: "/veille" },
  { slug: "plus", label: "Menu Plus", path: "/plus" },
  { slug: "parametres", label: "Paramètres (profil)", path: "/parametres" },
  { slug: "parametres-abonnement", label: "Paramètres — Abonnement", path: "/parametres?onglet=abonnement" },
  { slug: "compte", label: "Mon compte", path: "/compte" },
  { slug: "entreprise", label: "Mon entreprise", path: "/entreprise" },
  { slug: "onboarding", label: "Onboarding", path: "/onboarding" },
];

/** Même routes, viewport mobile (Figma 372:7378). */
export const MOBILE_STATIC_PAGES = STATIC_PAGES.map((p) => ({
  ...p,
  slug: `${p.slug}-mobile`,
  label: `${p.label} (mobile)`,
}));

export const DETAIL_TEMPLATES = [
  {
    slug: "document-detail",
    label: "Document détail (devis/facture)",
    listPath: "/documents",
    linkPattern: /^\/documents\/[a-z0-9]+$/i,
  },
  {
    slug: "fournisseur-detail",
    label: "Fournisseur détail",
    listPath: "/fournisseurs",
    linkPattern: /^\/fournisseurs\/[^/]+$/,
  },
  {
    slug: "devis-client-detail",
    label: "Devis client détail",
    listPath: "/devis-clients",
    linkPattern: /^\/devis-clients\/[a-z0-9]+$/i,
  },
  {
    slug: "client-detail",
    label: "Client détail",
    listPath: "/clients",
    linkPattern: /^\/clients\/[a-z0-9]+$/i,
  },
];

export const MOBILE_DETAIL_TEMPLATES = DETAIL_TEMPLATES.map((t) => ({
  ...t,
  slug: `${t.slug}-mobile`,
  label: `${t.label} (mobile)`,
}));
