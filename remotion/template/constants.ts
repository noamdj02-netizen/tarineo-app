/** Timeline fidèle à la ref (~25 s @ 30 fps). */

export const C = {
  canvas: "#F5F5F3",
  white: "#FFFFFF",
  ink: "#0A0A0A",
  muted: "#6E6E6E",
  soft: "#E8E8E6",
  accent: "#FF6B1A",
  accentSoft: "rgba(255,107,26,0.14)",
  border: "rgba(10,10,10,.08)",
  grid: "rgba(10,10,10,.055)",
} as const;

export const SHADOW =
  "0 0 0 1px rgba(10,10,10,0.04), 0 10px 32px rgba(10,10,10,0.08), 0 28px 56px -24px rgba(10,10,10,0.16)";

export const FPS = 30;

/**
 * Timestamps calqués sur preview_540p_crf22 (25.0 s).
 * Ne pas allonger / ralentir.
 */
export const SCENE = {
  circles: { from: 0, duration: 45 }, // 0.0 → 1.5
  unlock: { from: 45, duration: 30 }, // 1.5 → 2.5
  unlockVideo: { from: 75, duration: 60 }, // 2.5 → 4.5
  portraits: { from: 135, duration: 75 }, // 4.5 → 7.0
  mutate: { from: 210, duration: 45 }, // 7.0 → 8.5
  waiting: { from: 255, duration: 45 }, // 8.5 → 10.0
  upload: { from: 300, duration: 75 }, // 10.0 → 12.5
  prompt: { from: 375, duration: 105 }, // 12.5 → 16.0
  spinner: { from: 480, duration: 30 }, // 16.0 → 17.0
  makeSimple: { from: 510, duration: 45 }, // 17.0 → 18.5
  startNow: { from: 555, duration: 60 }, // 18.5 → 20.5
  logoArcs: { from: 615, duration: 60 }, // 20.5 → 22.5
  logoEnd: { from: 675, duration: 75 }, // 22.5 → 25.0
} as const;

export const DURATION = SCENE.logoEnd.from + SCENE.logoEnd.duration; // 750
export const ID = "TarineoTemplate";
export const ID_4K = "TarineoTemplate-4K";
export const SIZE = { width: 1920, height: 1080 } as const;
export const SIZE_4K = { width: 3840, height: 2160 } as const;
