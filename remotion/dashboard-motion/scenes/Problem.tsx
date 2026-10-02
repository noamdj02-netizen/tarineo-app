import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { fontSans } from "../../fonts";
import { Grain, Grid, TextReveal } from "../components/Atmosphere";
import { COLORS } from "../constants";
import { PROBLEM_LINES } from "../data";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const camX = interpolate(frame, [0, 90], [0, -28], clamp);
  const camY = interpolate(frame, [0, 90], [0, 12], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, fontFamily: fontSans }}>
      <Grid opacity={0.03} />
      <Grain />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 140px",
          transform: `translate(${camX}px, ${camY}px)`,
          gap: 10,
        }}
      >
        {PROBLEM_LINES.map((line, i) => (
          <TextReveal key={line} start={6 + i * 26} duration={20} distance={22} blur={8}>
            <h1
              style={{
                margin: 0,
                fontSize: 92,
                lineHeight: 1.02,
                fontWeight: 700,
                letterSpacing: "-0.045em",
                color: COLORS.white,
              }}
            >
              {line}
            </h1>
          </TextReveal>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
