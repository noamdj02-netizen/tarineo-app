/** Palette + timeline — motion Dashboard TARINEO (~30 s). */

export const COLORS = {
  ink: "#0A0A0A",
  dark: "#111111",
  canvas: "#F5F5F3",
  white: "#FFFFFF",
  muted: "#6E6E6E",
  border: "rgba(10,10,10,.08)",
  accent: "#FF6B1A",
  accentSoft: "rgba(255,107,26,0.12)",
  accentWash: "rgba(255,107,26,0.06)",
  success: "#16A34A",
  warn: "#F59E0B",
} as const;

export const SHADOW =
  "0 0 0 1px rgba(10,10,10,0.04), 0 2px 8px rgba(10,10,10,0.04), 0 28px 56px -24px rgba(10,10,10,0.22)";

export const SHADOW_LIFT =
  "0 0 0 1px rgba(10,10,10,0.05), 0 12px 32px rgba(10,10,10,0.08), 0 40px 72px -28px rgba(10,10,10,0.28)";

export const FPS = 30;

/** Durées en frames @ 30 fps — total 30 s. */
export const SCENE = {
  intro: { from: 0, duration: 90 },
  problem: { from: 90, duration: 90 },
  arrive: { from: 180, duration: 90 },
  dashboard: { from: 270, duration: 120 },
  devis: { from: 390, duration: 120 },
  assistant: { from: 510, duration: 120 },
  achats: { from: 630, duration: 90 },
  overview: { from: 720, duration: 90 },
  outro: { from: 810, duration: 90 },
} as const;

export const DURATION_IN_FRAMES =
  SCENE.outro.from + SCENE.outro.duration; // 900

export const COMPOSITION_ID = "TarineoDashboard";

export const SIZE = {
  width: 1920,
  height: 1080,
} as const;
