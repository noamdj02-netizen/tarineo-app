import { interpolate } from "remotion";
import { COLORS } from "../constants";
import { EASE } from "../animations";

/** Scan vertical subtil (document). */
export function VerticalScan({
  frame,
  start,
  duration,
  height,
}: {
  frame: number;
  start: number;
  duration: number;
  height: number;
}) {
  const progress = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const opacity = interpolate(
    frame,
    [start, start + 8, start + duration - 8, start + duration],
    [0, 0.9, 0.9, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: progress * (height - 2),
        height: 2,
        opacity,
        background: `linear-gradient(90deg, transparent 0%, ${COLORS.accent} 20%, ${COLORS.accent} 80%, transparent 100%)`,
        boxShadow: `0 0 18px 2px rgba(236,88,33,0.35)`,
        pointerEvents: "none",
      }}
    />
  );
}

/** Scan horizontal (analyse). */
export function HorizontalScan({
  frame,
  start,
  duration,
  width,
}: {
  frame: number;
  start: number;
  duration: number;
  width: number;
}) {
  const progress = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const opacity = interpolate(
    frame,
    [start, start + 6, start + duration - 6, start + duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: progress * (width - 2),
        width: 2,
        opacity,
        background: `linear-gradient(180deg, transparent 0%, ${COLORS.accent} 25%, ${COLORS.accent} 75%, transparent 100%)`,
        boxShadow: `0 0 20px 3px rgba(236,88,33,0.28)`,
        pointerEvents: "none",
      }}
    />
  );
}
