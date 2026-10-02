import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { TarineoLogoMark } from "../../components/TarineoLogoMark";
import { C } from "../constants";
import { COPY } from "../data";
import { Grain, Reveal, Stage } from "../ui";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

const ARROWS = [
  { glyph: "↗", x: -170, y: -130 },
  { glyph: "↘", x: 170, y: -130 },
  { glyph: "↙", x: 170, y: 130 },
  { glyph: "↖", x: -170, y: 130 },
] as const;

export const LogoOutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const converge = interpolate(frame, [28, 58], [0, 1], clamp);

  return (
    <Stage>
      <Grain />
      <AbsoluteFill>
        {ARROWS.map((a, i) => {
          const start = 8 + i * 6;
          const op = interpolate(frame, [start, start + 12], [0, 1], clamp);
          const x = interpolate(converge, [0, 1], [a.x, 0], clamp);
          const y = interpolate(converge, [0, 1], [a.y, 0], clamp);
          const fade = interpolate(converge, [0.55, 1], [1, 0], clamp);
          return (
            <span
              key={a.glyph}
              style={{
                position: "absolute",
                left: "50%",
                top: "40%",
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                opacity: Math.min(op, fade),
                color: C.accent,
                fontSize: 38,
                fontWeight: 700,
              }}
            >
              {a.glyph}
            </span>
          );
        })}

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "40%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Reveal start={16} duration={16}>
            <TarineoLogoMark size={68} variant="light" />
          </Reveal>
          <Reveal start={28} duration={14}>
            <p
              style={{
                margin: 0,
                fontSize: 42,
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: C.ink,
              }}
            >
              {COPY.brand}
            </p>
          </Reveal>
          <Reveal start={42} duration={14}>
            <p style={{ margin: 0, fontSize: 20, color: C.muted }}>{COPY.outroTagline}</p>
          </Reveal>
          <Reveal start={54} duration={14}>
            <p style={{ margin: "6px 0 0", fontSize: 16, fontWeight: 650, color: C.accent }}>
              {COPY.cta}
            </p>
          </Reveal>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
