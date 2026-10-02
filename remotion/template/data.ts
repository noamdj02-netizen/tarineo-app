/** Copy + assets — mêmes emplacements que la référence. */

export const COPY = {
  unlock: "Protégez votre marge",
  waiting: "Fini le chaos documents",
  addTask: "Importer",
  upload: "Importez vos devis",
  uploadFile: "DEVIS.pdf",
  prompt:
    "Analyse ces devis et factures fournisseurs. Identifie les hausses et l’impact sur ma marge chantier.",
  makeSimple: "Votre métier,",
  makeSimpleEnd: "simplifié.",
  workBadge: "TARINEO",
  startNow: "Maintenant.",
  brand: "TARINEO",
  url: "app.tarineo.com",
} as const;

/** 3 portraits → 3 visuels BTP (même grille 1×3). */
export const PORTRAITS = [
  {
    src: "landing/testimonials/karim.jpg",
    label: "PLOMBIER",
    orangeBg: false,
  },
  {
    src: "landing/testimonials/marcus.jpg",
    label: "ÉLECTRICIEN",
    orangeBg: true,
  },
  {
    src: "landing/testimonials/noam.jpg",
    label: "CHAUFFAGISTE",
    orangeBg: false,
  },
] as const;

export const PROMPT_THUMBS = [
  { src: "landing/testimonials/karim.jpg", kind: "DEVIS" },
  { src: "landing/testimonials/sarah.jpg", kind: "FACTURE" },
  { src: "landing/testimonials/lea.jpg", kind: "ACHAT" },
] as const;

export const HERO_VIDEO = "landing/hero.mp4";
export const HERO_POSTER = "landing/hero-poster.webp";
