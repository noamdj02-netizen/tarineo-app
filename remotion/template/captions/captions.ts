import type { Caption } from "@remotion/captions";

/**
 * Captions premium — syncés sur les scènes du template Tarineo (25 s).
 * Espaces inclus avant chaque mot (whitespace-sensitive).
 */
export const TEMPLATE_CAPTIONS: Caption[] = [
  { text: " Protégez", startMs: 1800, endMs: 2600, timestampMs: 1800, confidence: 1 },
  { text: " votre", startMs: 2600, endMs: 3100, timestampMs: 2600, confidence: 1 },
  { text: " marge", startMs: 3100, endMs: 4200, timestampMs: 3100, confidence: 1, pageBreakAfter: true },

  { text: " Documents", startMs: 4500, endMs: 5400, timestampMs: 4500, confidence: 1 },
  { text: " métier", startMs: 5400, endMs: 6200, timestampMs: 5400, confidence: 1 },
  { text: " artisans", startMs: 6200, endMs: 7600, timestampMs: 6200, confidence: 1, pageBreakAfter: true },

  { text: " Analyse", startMs: 8200, endMs: 9000, timestampMs: 8200, confidence: 1 },
  { text: " automatique", startMs: 9000, endMs: 10400, timestampMs: 9000, confidence: 1, pageBreakAfter: true },

  { text: " Fini", startMs: 11000, endMs: 11600, timestampMs: 11000, confidence: 1 },
  { text: " le", startMs: 11600, endMs: 12000, timestampMs: 11600, confidence: 1 },
  { text: " chaos", startMs: 12000, endMs: 13200, timestampMs: 12000, confidence: 1, pageBreakAfter: true },

  { text: " Copilote", startMs: 13800, endMs: 14800, timestampMs: 13800, confidence: 1 },
  { text: " TARINEO", startMs: 14800, endMs: 16200, timestampMs: 14800, confidence: 1, pageBreakAfter: true },

  { text: " Outil", startMs: 17600, endMs: 18400, timestampMs: 17600, confidence: 1 },
  { text: " métier", startMs: 18400, endMs: 19600, timestampMs: 18400, confidence: 1, pageBreakAfter: true },

  { text: " Maintenant", startMs: 20200, endMs: 21600, timestampMs: 20200, confidence: 1, pageBreakAfter: true },

  { text: " app.tarineo.com", startMs: 22400, endMs: 24800, timestampMs: 22400, confidence: 1 },
];
