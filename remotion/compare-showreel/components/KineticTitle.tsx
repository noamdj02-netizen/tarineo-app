import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE } from "../../animations";
import { THEME } from "../constants";
import { fontDisplay, fontSans } from "../fonts";

export const KineticTitle: React.FC<{
  lines: { text: string; size?: "xl" | "lg" | "md"; accent?: boolean }[];
  start?: number;
}> = ({ lines, start = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {lines.map((line, i) => {
        const delay = start + i * 6;
        const spr = spring({
          frame: frame - delay,
          fps,
          config: { damping: 18, stiffness: 220, mass: 0.7 },
        });
        const y = interpolate(spr, [0, 1], [48, 0], { easing: EASE });
        const opacity = interpolate(frame, [delay, delay + 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const size =
          line.size === "xl"
            ? "clamp(72px, 8vw, 112px)"
            : line.size === "lg"
              ? "clamp(52px, 5.5vw, 84px)"
              : "clamp(40px, 4vw, 56px)";

        return (
          <span
            key={`${line.text}-${i}`}
            style={{
              display: "block",
              fontFamily: line.accent ? fontDisplay : fontSans,
              fontSize: size,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.02,
              color: line.accent ? THEME.orange : THEME.ink,
              transform: `translateY(${y}px) scale(${interpolate(spr, [0, 1], [0.92, 1])})`,
              opacity,
            }}
          >
            {line.text}
          </span>
        );
      })}
    </div>
  );
};
