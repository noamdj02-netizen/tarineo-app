import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { fontSans } from "../../fonts";
import { Grain, TextReveal } from "../components/Atmosphere";
import { COLORS, SHADOW } from "../constants";
import { PRICE_EXAMPLE } from "../data";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

export const AchatsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const slide = interpolate(frame, [0, 22], [36, 0], clamp);
  const flip = interpolate(frame, [28, 48], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.canvas, fontFamily: fontSans }}>
      <Grain opacity={0.02} />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          transform: `translateY(${slide}px)`,
        }}
      >
        <TextReveal start={2} duration={16}>
          <h2
            style={{
              margin: 0,
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "-0.035em",
            }}
          >
            TARINEO détecte les évolutions.
          </h2>
        </TextReveal>

        <div
          style={{
            width: 560,
            background: COLORS.white,
            borderRadius: 20,
            border: `1px solid ${COLORS.border}`,
            boxShadow: SHADOW,
            padding: 28,
          }}
        >
          <p style={{ margin: 0, fontSize: 12, color: COLORS.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {PRICE_EXAMPLE.note}
          </p>
          <p style={{ margin: "10px 0 22px", fontSize: 20, fontWeight: 650 }}>{PRICE_EXAMPLE.label}</p>

          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <span
              style={{
                fontSize: 28,
                color: COLORS.muted,
                textDecoration: flip > 0.5 ? "line-through" : "none",
                opacity: interpolate(flip, [0, 1], [1, 0.45], clamp),
              }}
            >
              {PRICE_EXAMPLE.oldPrice}
            </span>
            <span style={{ fontSize: 22, color: COLORS.muted }}>→</span>
            <span
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: COLORS.ink,
                opacity: interpolate(flip, [0.35, 1], [0, 1], clamp),
              }}
            >
              {PRICE_EXAMPLE.newPrice}
            </span>
            <span
              style={{
                marginLeft: 8,
                fontSize: 15,
                fontWeight: 700,
                color: COLORS.accent,
                background: COLORS.accentSoft,
                padding: "6px 10px",
                borderRadius: 999,
                opacity: interpolate(frame, [46, 58], [0, 1], clamp),
              }}
            >
              {PRICE_EXAMPLE.pct}
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
