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

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(frame, [0, 18, 50], [0, 0.55, 1], clamp);
  const logoY = interpolate(frame, [70, 90], [0, 28], clamp);
  const logoScale = interpolate(frame, [70, 90], [1, 0.88], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, fontFamily: fontSans }}>
      <Grid opacity={0.028} />
      <Glow size={560} intensity={glow} />
      <Grain />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          transform: `translateY(${logoY}px) scale(${logoScale})`,
        }}
      >
        <TextReveal start={28} duration={22} distance={14} blur={6}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <TarineoLogoMark size={56} variant="dark" />
            <p
              style={{
                margin: 0,
                color: COLORS.white,
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: "0.14em",
              }}
            >
              {BRAND_COPY.name}
            </p>
          </div>
        </TextReveal>
        <TextReveal start={48} duration={20} distance={12} blur={5}>
          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.62)",
              fontSize: 22,
              fontWeight: 450,
              letterSpacing: "-0.01em",
            }}
          >
            {BRAND_COPY.tagline}
          </p>
        </TextReveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
