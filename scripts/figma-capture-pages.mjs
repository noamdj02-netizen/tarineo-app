/** Pages statiques + écrans de détail (paths dynamiques résolus au runtime). */
export const STATIC_PAGES = [
  { slug: "accueil", label: "Accueil", path: "/accueil" },
  { slug: "documents", label: "Documents (liste)", path: "/documents" },
  { slug: "devis-fournisseurs", label: "Devis fournisseurs", path: "/documents/devis-fournisseurs" },
  { slug: "factures-fournisseurs", label: "Factures fournisseurs", path: "/documents/factures-fournisseurs" },
  { slug: "bons-commande", label: "Bons de commande", path: "/bons-de-commande" },
  { slug: "bons-enlevement", label: "Bons d'enlèvement", path: "/bons-enlevement" },
  { slug: "fournisseurs", label: "Fournisseurs (liste)", path: "/fournisseurs" },
  { slug: "devis-clients", label: "Devis clients (liste)", path: "/devis-clients" },
  { slug: "devis-nouveau", label: "Nouveau devis client", path: "/devis-clients/nouveau" },
  { slug: "factures-clients", label: "Factures clients", path: "/factures-clients" },
  { slug: "clients", label: "Clients (liste)", path: "/clients" },
  { slug: "facturation", label: "Facturation électronique", path: "/facturation-clients" },
  { slug: "parametres", label: "Paramètres", path: "/parametres" },
  { slug: "compte", label: "Mon compte", path: "/compte" },
  { slug: "entreprise", label: "Mon entreprise", path: "/entreprise" },
  { slug: "onboarding", label: "Onboarding", path: "/onboarding" },
];

/** Écrans de détail — path découvert après connexion (premier élément de chaque liste). */
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
