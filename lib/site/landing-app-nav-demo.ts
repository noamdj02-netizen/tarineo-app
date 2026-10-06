/**
 * Démo shell produit (landing v2) + textes pour calques LottieLab.
 * Libellés alignés sur `NAV_SECTIONS` dans lib/nav.ts (sans routes app).
 */

import type { IconName } from "@/lib/site/landing-v2-content";

export type LandingSidebarItem = {
  icon: IconName;
  label: string;
  active?: boolean;
  /** Sous-entrée (ex. Devis sous Documents fournisseur). */
  nested?: boolean;
};

export type LandingSidebarGroup = {
  title: string;
  items: LandingSidebarItem[];
};

/** Barre latérale — même structure que l’app réelle. */
export const LANDING_PRODUCT_SIDEBAR: LandingSidebarGroup[] = [
  {
    title: "Aujourd'hui",
    items: [
      { icon: "site", label: "Accueil", active: true },
      { icon: "spark", label: "Analyse IA" },
    ],
  },
  {
    title: "Documents",
    items: [
      { icon: "doc", label: "Documents fournisseur" },
      { icon: "doc", label: "Devis", nested: true },
      { icon: "box", label: "Bons de commande", nested: true },
      { icon: "invoice", label: "Bons d'enlèvement", nested: true },
      { icon: "invoice", label: "Factures fournisseur", nested: true },
      { icon: "site", label: "Documents entreprise" },
      { icon: "doc", label: "Devis client", nested: true },
      { icon: "invoice", label: "Factures client", nested: true },
    ],
  },
  {
    title: "Chantiers",
    items: [{ icon: "site", label: "Chantiers" }],
  },
  {
    title: "Achats",
    items: [
      { icon: "box", label: "Fournisseurs" },
      { icon: "history", label: "Comparateur" },
      { icon: "bell", label: "Hausses" },
      { icon: "mail", label: "Relances" },
      { icon: "box", label: "Produits" },
      { icon: "doc", label: "Export comptable" },
      { icon: "history", label: "Achats" },
    ],
  },
];

export const LANDING_PRODUCT_CHROME = {
  searchPlaceholder: "Rechercher",
  searchShortcut: "⌘K",
  breadcrumb: ["Accueil", "Chantiers", "Rénovation SDB — Dupont"] as const,
  pageTitle: "Rénovation SDB — Dupont",
  pageMeta: "12 rue des Acacias, 69003 Lyon · Madame Dupont",
  status: "En cours",
  primaryCta: "Nouveau chantier",
  todoSection: "À traiter",
  todaySection: "Aujourd'hui",
  todayGreeting: "Bonjour, Noam",
  todayQuestion: "Quels prix ont bougé aujourd'hui ?",
};

/**
 * Liste pour calques texte LottieLab
 * (projet https://www.lottielab.com/editor?project=ee23a588-1ea5-4e82-824f-21fe4ad1bfb4)
 */
export const LOTTIELAB_DASHBOARD_TEXT_LAYERS: readonly string[] = [
  "Tarinéo",
  ...LANDING_PRODUCT_SIDEBAR.flatMap((g) => [g.title, ...g.items.map((i) => i.label)]),
  LANDING_PRODUCT_CHROME.searchPlaceholder,
  LANDING_PRODUCT_CHROME.searchShortcut,
  ...LANDING_PRODUCT_CHROME.breadcrumb,
  LANDING_PRODUCT_CHROME.pageTitle,
  LANDING_PRODUCT_CHROME.primaryCta,
  LANDING_PRODUCT_CHROME.todoSection,
  LANDING_PRODUCT_CHROME.todayGreeting,
  "Devis",
  "Achats",
  "Marge",
  "Documents",
];
