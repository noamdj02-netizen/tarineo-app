/** Palette + timeline — vidéo motion Tarinéo. */

export const COLORS = {
  bg: "#F5F5F3",
  surface: "#FFFFFF",
  text: "#111111",
  muted: "#6E6E6E",
  border: "rgba(17,17,17,0.08)",
  accent: "#EC5821",
  accentSoft: "#FFF0EA",
  success: "#1A7F4B",
  successSoft: "#E8F6EE",
} as const;

export const SHADOW =
  "0 0 0 1px rgba(17,17,17,0.04), 0 2px 8px rgba(17,17,17,0.04), 0 24px 48px -24px rgba(17,17,17,0.18)";

export const SHADOW_LIFT =
  "0 0 0 1px rgba(17,17,17,0.05), 0 8px 24px rgba(17,17,17,0.06), 0 32px 64px -28px rgba(17,17,17,0.22)";

export const FPS = 30;

/** Durées en frames @ 30 fps — total 15.5 s. */
export const SCENE = {
  document: { from: 0, duration: 90 }, // 0 → 3.0s
  analysis: { from: 90, duration: 120 }, // 3.0 → 7.0s
  detection: { from: 210, duration: 90 }, // 7.0 → 10.0s
  margin: { from: 300, duration: 120 }, // 10.0 → 14.0s
  close: { from: 420, duration: 45 }, // 14.0 → 15.5s
} as const;

export const DURATION_IN_FRAMES =
  SCENE.close.from + SCENE.close.duration; // 465

export const COMPOSITION = {
  landscape: { id: "TarineoExplainer", width: 1920, height: 1080 },
  portrait: { id: "TarineoExplainerPortrait", width: 1080, height: 1920 },
} as const;

export type AspectMode = "landscape" | "portrait";
