/** Données narratives de la vidéo (facture CEDEO → marge). */

export const INVOICE = {
  supplier: "CEDEO",
  ref: "FAC-2026-08421",
  date: "12 mars 2026",
  lines: [
    { label: "Tube PER 20 × 16", qty: "12 ml", price: "48,50 €", muted: false },
    { label: "Raccord laiton 20", qty: "8 u", price: "19,90 €", muted: false },
    { label: "Isolant calorifuge", qty: "6 ml", price: "14,20 €", muted: false },
    { label: "Main d’œuvre", qty: "1", price: "…", muted: true },
  ],
  total: "1 284,50 €",
} as const;

export const ANALYSIS = {
  lines: 127,
  evolution: 8.4,
  increases: 3,
  anomalies: 1,
} as const;

export const DETECTION = {
  product: "Tube PER 20 × 16",
  oldPrice: "42,80 €",
  newPrice: "48,50 €",
  pct: 13.3,
} as const;

export const MARGIN = {
  before: 24.8,
  after: 27.4,
  deltaPts: 2.6,
} as const;

export const CLOSE = {
  brand: "TARINEO",
  tagline: "L’assistant qui protège votre marge.",
  cta: "Analyser un document →",
} as const;

/** Points pour le mini graphique d’évolution (0–1). */
export const CHART_POINTS = [0.22, 0.28, 0.31, 0.36, 0.42, 0.55, 0.68, 0.82, 0.94];
