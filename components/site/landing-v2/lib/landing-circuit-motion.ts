/** Keyframes partagés — courant sur tracés circuit (hero + sections). */
export const LANDING_CIRCUIT_DURATION = 8.877;

export const LANDING_CIRCUIT_TIMES = [
  0, 0.0484, 0.0529, 0.2402, 0.2709, 0.3639, 0.3684, 0.5557, 0.5863, 0.6793, 0.6838, 0.8711,
  0.9018, 1,
] as const;

export const LANDING_CIRCUIT_CURRENT = {
  opacity: [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  strokeDasharray: [
    "0 1",
    "0 1",
    "0.16 1",
    "0.16 1",
    "0 1",
    "0 1",
    "0.16 1",
    "0.16 1",
    "0 1",
    "0 1",
    "0.16 1",
    "0.16 1",
    "0 1",
    "0 1",
  ],
  strokeDashoffset: [0, 0, 0, -0.84, -1, 0, 0, -0.84, -1, 0, 0, -0.84, -1, -1],
};
