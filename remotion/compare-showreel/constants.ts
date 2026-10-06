/** Showreel comparatif — même structure qu’une vidéo « canal A vs canal B », adapté Tarineo. */

export const FPS = 30;

export const SIZE = { width: 1920, height: 1080 } as const;

export const ID = "TarineoCompareShowreel";

export const THEME = {
  canvas: "#F7F5F0",
  ink: "#0A0A0A",
  muted: "#5A5A5A",
  line: "rgba(10,10,10,0.08)",
  orange: "#FF6B1A",
  orangeGlow: "rgba(255,107,26,0.35)",
  excelGreen: "#1D6F42",
  excelBg: "#E9ECE8",
  excelMuted: "#6B7280",
  danger: "#DC2626",
  success: "#15803D",
} as const;

export const MONTAGE_CLIP_FRAMES = 70;
export const MONTAGE_CLIP_COUNT = 7;

/** Durées par séquence (frames @ 30 fps) — ~58 s total. */
export const SEQ = {
  hook: 90,
  vsIntro: 120,
  roundDetection: 240,
  roundTime: 180,
  roundMargin: 210,
  montageUi: MONTAGE_CLIP_FRAMES * MONTAGE_CLIP_COUNT,
  winner: 180,
  outro: 120,
} as const;

export const DURATION_IN_FRAMES = Object.values(SEQ).reduce((a, b) => a + b, 0);

/** Début global de chaque séquence (pour SFX). */
export const SEQ_FROM = (() => {
  let acc = 0;
  const out: Record<keyof typeof SEQ, number> = {} as Record<keyof typeof SEQ, number>;
  for (const key of Object.keys(SEQ) as (keyof typeof SEQ)[]) {
    out[key] = acc;
    acc += SEQ[key];
  }
  return out;
})();

export const SFX_CUES = [
  { at: SEQ_FROM.hook + 72, file: "sfx-whoosh.mp3", frames: 24, volume: 0.45 },
  { at: SEQ_FROM.vsIntro, file: "sfx-pop.mp3", frames: 18, volume: 0.4 },
  { at: SEQ_FROM.roundDetection + 30, file: "sfx-tick.mp3", frames: 12, volume: 0.35 },
  { at: SEQ_FROM.roundTime + 40, file: "sfx-pop.mp3", frames: 16, volume: 0.38 },
  { at: SEQ_FROM.roundMargin + 50, file: "sfx-tick.mp3", frames: 14, volume: 0.35 },
  { at: SEQ_FROM.montageUi, file: "sfx-whoosh.mp3", frames: 28, volume: 0.42 },
  { at: SEQ_FROM.montageUi + 100, file: "sfx-whoosh.mp3", frames: 24, volume: 0.38 },
  { at: SEQ_FROM.montageUi + 140, file: "sfx-whoosh.mp3", frames: 24, volume: 0.38 },
  { at: SEQ_FROM.montageUi + 210, file: "sfx-whoosh.mp3", frames: 24, volume: 0.36 },
  { at: SEQ_FROM.montageUi + 280, file: "sfx-whoosh.mp3", frames: 24, volume: 0.36 },
  { at: SEQ_FROM.montageUi + 350, file: "sfx-whoosh.mp3", frames: 24, volume: 0.36 },
  { at: SEQ_FROM.montageUi + 420, file: "sfx-whoosh.mp3", frames: 24, volume: 0.36 },
  { at: SEQ_FROM.winner, file: "sfx-lock.mp3", frames: 20, volume: 0.45 },
  { at: SEQ_FROM.outro + 20, file: "sfx-pop.mp3", frames: 18, volume: 0.4 },
] as const;
