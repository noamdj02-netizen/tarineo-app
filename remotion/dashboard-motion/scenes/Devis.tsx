import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { fontSans } from "../../fonts";
import { Grain, TextReveal } from "../components/Atmosphere";
import { COLORS, SHADOW } from "../constants";
import { DEVIS_OPTIONS } from "../data";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

export const DevisScene: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 24], [1.08, 1], clamp);
  const pan = interpolate(frame, [0, 30], [40, 0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.canvas, fontFamily: fontSans }}>
      <Grain opacity={0.02} />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          transform: `scale(${zoom}) translateY(${pan}px)`,
        }}
      >
        <TextReveal start={4} duration={18}>
          <h2
            style={{
              margin: 0,
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: COLORS.ink,
            }}
          >
            Créer un devis.
          </h2>
        </TextReveal>

        <div style={{ display: "flex", gap: 18 }}>
          {DEVIS_OPTIONS.map((opt, i) => {
            const start = 22 + i * 12;
            const op = interpolate(frame, [start, start + 16], [0, 1], clamp);
            const y = interpolate(frame, [start, start + 16], [24, 0], clamp);
            const sc = interpolate(frame, [start, start + 16], [0.96, 1], clamp);
            return (
              <div
                key={opt.title}
                style={{
                  width: 260,
                  opacity: op,
                  transform: `translateY(${y}px) scale(${sc})`,
                  background: COLORS.white,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 20,
                  padding: "28px 24px",
                  boxShadow: SHADOW,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: COLORS.accentSoft,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 22,
                    marginBottom: 16,
                  }}
                >
                  {opt.icon}
                </div>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 650 }}>{opt.title}</p>
                <p style={{ margin: "8px 0 0", fontSize: 14, color: COLORS.muted }}>{opt.hint}</p>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
