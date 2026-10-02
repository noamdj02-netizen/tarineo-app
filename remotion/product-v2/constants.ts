/** TARINEO Product V2 — motion 30 s @ 30 fps */

export const C = {
  canvas: "#F5F5F3",
  white: "#FFFFFF",
  ink: "#0A0A0A",
  muted: "#6E6E6E",
  accent: "#FF6B1A",
  accentSoft: "rgba(255,107,26,0.12)",
  border: "rgba(10,10,10,.08)",
  dark: "#0A0A0A",
} as const;

export const SHADOW =
  "0 0 0 1px rgba(10,10,10,0.04), 0 2px 8px rgba(10,10,10,0.04), 0 24px 48px -24px rgba(10,10,10,0.16)";

export const FPS = 30;

/** 24 s @ 30 fps — rythme promo (douleur → dashboard réel). */
export const SCENE = {
  metiers: { from: 0, duration: 65 },
  upload: { from: 65, duration: 58 },
  analyse: { from: 123, duration: 92 },
  copilote: { from: 215, duration: 55 },
  transform: { from: 270, duration: 75 },
  ecosystem: { from: 345, duration: 65 },
  dashboard: { from: 410, duration: 125 },
  export: { from: 535, duration: 55 },
  v2: { from: 590, duration: 50 },
  logo: { from: 640, duration: 80 },
} as const;

export const DURATION = SCENE.logo.from + SCENE.logo.duration; // 720 = 24s
export const ID = "TarineoProductV2";
export const ID_4K = "TarineoProductV2-4K";
export const SIZE = { width: 1920, height: 1080 } as const;
export const SIZE_4K = { width: 3840, height: 2160 } as const;
