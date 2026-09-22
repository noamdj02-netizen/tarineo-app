import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

export function GradientBackground({ variant = "hero" }: { variant?: "hero" | "light" | "dark" }) {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 40) * 20;

  if (variant === "light") {
    return (
      <AbsoluteFill style={{ background: COLORS.appBg }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at ${50 + drift * 0.1}% 20%, ${COLORS.orangePale} 0%, transparent 50%)`,
          }}
        />
      </AbsoluteFill>
    );
  }

  if (variant === "dark") {
    return (
      <AbsoluteFill style={{ background: COLORS.night }}>
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(236,88,33,0.35) 0%, transparent 70%)`,
            top: -100 + drift,
            right: -100,
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,107,22,0.2) 0%, transparent 70%)`,
            bottom: -80,
            left: -80,
            filter: "blur(50px)",
          }}
        />
      </AbsoluteFill>
    );
  }

  const shift = interpolate(frame, [0, 900], [0, 15]);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${135 + shift}deg, #FFE4A9 0%, #FF6B16 28%, #E63B0B 55%, #32130E 82%, #141C2B 100%)`,
      }}
    />
  );
}
