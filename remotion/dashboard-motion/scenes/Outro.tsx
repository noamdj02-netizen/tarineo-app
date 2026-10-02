import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { TarineoLogoMark } from "../../components/TarineoLogoMark";
import { fontSans } from "../../fonts";
import { Glow, Grain, Grid, TextReveal } from "../components/Atmosphere";
import { COLORS } from "../constants";
import { BRAND_COPY } from "../data";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [0, 24], [0.4, 1], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, fontFamily: fontSans }}>
      <Grid opacity={0.03} />
      <Glow size={520} intensity={glow} />
      <Grain />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <TextReveal start={6} duration={18} distance={12} blur={5}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <TarineoLogoMark size={52} variant="dark" />
            <p
              style={{
                margin: 0,
                color: COLORS.white,
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: "0.14em",
              }}
            >
              {BRAND_COPY.name}
            </p>
          </div>
        </TextReveal>
        <TextReveal start={22} duration={16} distance={10} blur={4}>
          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.65)",
              fontSize: 22,
              fontWeight: 450,
            }}
          >
            {BRAND_COPY.tagline}
          </p>
        </TextReveal>
        <TextReveal start={40} duration={16} distance={8} blur={3}>
          <p
            style={{
              margin: "12px 0 0",
              color: COLORS.accent,
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {BRAND_COPY.ctaHost}
          </p>
        </TextReveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
