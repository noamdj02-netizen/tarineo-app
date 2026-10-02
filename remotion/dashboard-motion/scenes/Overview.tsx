import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { fontSans } from "../../fonts";
import { Grain, TextReveal } from "../components/Atmosphere";
import { DashboardMockup } from "../components/DashboardMockup";
import { COLORS } from "../constants";
import { ORBIT_ITEMS } from "../data";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

export const OverviewScene: React.FC = () => {
  const frame = useCurrentFrame();
  const converge = interpolate(frame, [0, 50], [0, 1], clamp);
  const dashScale = interpolate(frame, [20, 60], [0.88, 0.94], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.canvas, fontFamily: fontSans }}>
      <Grain opacity={0.02} />

      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <DashboardMockup layerProgress={1} zoom={dashScale} />
      </AbsoluteFill>

      {ORBIT_ITEMS.map((label, i) => {
        const angle = (i / ORBIT_ITEMS.length) * Math.PI * 2 - Math.PI / 2;
        const radius = interpolate(converge, [0, 1], [340, 210], clamp);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const op = interpolate(frame, [4 + i * 4, 18 + i * 4], [0, 1], clamp);
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              opacity: op,
              background: COLORS.white,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 999,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 650,
              color: COLORS.ink,
              boxShadow: "0 8px 24px rgba(10,10,10,0.08)",
            }}
          >
            {label}
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: 56,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <TextReveal start={40} duration={16} distance={14}>
          <p style={{ margin: 0, fontSize: 42, fontWeight: 700, letterSpacing: "-0.035em" }}>
            Tout votre métier.
          </p>
        </TextReveal>
        <TextReveal start={52} duration={16} distance={12}>
          <p style={{ margin: 0, fontSize: 42, fontWeight: 700, letterSpacing: "-0.035em", color: COLORS.accent }}>
            Au même endroit.
          </p>
        </TextReveal>
      </div>
    </AbsoluteFill>
  );
};
