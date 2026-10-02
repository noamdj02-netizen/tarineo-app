import { Easing, interpolate } from "remotion";

/** Courbe produit : cubic-bezier(0.2, 0.8, 0.2, 1). */
export const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

/** Fade + translateY + blur → sharp (reveal Linear/Apple). */
export function reveal(
  frame: number,
  start: number,
  duration = 18,
  distance = 16,
) {
  const input = [start, start + duration] as const;
  return {
    opacity: interpolate(frame, input, [0, 1], clamp),
    transform: `translateY(${interpolate(frame, input, [distance, 0], clamp)}px)`,
    filter: `blur(${interpolate(frame, input, [5, 0], clamp)}px)`,
  };
}

export function fade(frame: number, start: number, duration = 14) {
  return interpolate(frame, [start, start + duration], [0, 1], clamp);
}

export function fadeOut(frame: number, start: number, duration = 12) {
  return interpolate(frame, [start, start + duration], [1, 0], clamp);
}

/** Compteur entier progressif. */
export function countInt(frame: number, start: number, duration: number, to: number) {
  return Math.round(interpolate(frame, [start, start + duration], [0, to], clamp));
}

/** Compteur décimal (ex. 8.4 → une décimale). */
export function countFloat(
  frame: number,
  start: number,
  duration: number,
  to: number,
  decimals = 1,
) {
  const v = interpolate(frame, [start, start + duration], [0, to], clamp);
  return Number(v.toFixed(decimals));
}

export function scaleIn(frame: number, start: number, duration = 16) {
  const input = [start, start + duration] as const;
  return {
    opacity: interpolate(frame, input, [0, 1], clamp),
    transform: `scale(${interpolate(frame, input, [0.94, 1], clamp)})`,
  };
}

/** Entrée / sortie de scène pour crossfade propre. */
export function sceneOpacity(frame: number, duration: number, fadeFrames = 12) {
  const enter = interpolate(frame, [0, fadeFrames], [0, 1], clamp);
  const exit = interpolate(
    frame,
    [duration - fadeFrames, duration],
    [1, 0],
    clamp,
  );
  return Math.min(enter, exit);
}
