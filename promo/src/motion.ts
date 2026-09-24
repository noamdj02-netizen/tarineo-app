import { Easing, interpolate } from "remotion";

/** Même courbe que components/motion/reveal.tsx */
export const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

/** Reveal Mono Lead : 0.6 s = 18 frames à 30 fps, stagger 2 frames. */
export function reveal(frame: number, index = 0, start = 4) {
  const t = start + index * 2;
  const input = [t, t + 18] as const;
  const opts = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const, easing: EASE };
  return {
    opacity: interpolate(frame, input, [0, 1], opts),
    transform: `translateY(${interpolate(frame, input, [14, 0], opts)}px)`,
    filter: `blur(${interpolate(frame, input, [6, 0], opts)}px)`,
  };
}
