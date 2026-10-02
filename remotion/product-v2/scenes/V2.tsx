import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { C } from "../constants";
import { COPY } from "../data";
import { Grain, Reveal, Stage } from "../ui";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

export const V2Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [0, 18], [0, 100], clamp);

  return (
    <Stage dark>
      <Grain opacity={0.03} />
      <AbsoluteFill
        style={{
          background: `linear-gradient(90deg, ${C.accent} 0%, ${C.accent} ${wipe * 0.06}%, transparent ${wipe}%)`,
          opacity: 0.12,
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <Reveal start={8} duration={18} y={18} blur={8}>
          <h1
            style={{
              margin: 0,
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: C.white,
            }}
          >
            {COPY.v2Title}
          </h1>
        </Reveal>
        <Reveal start={26} duration={16} y={12} blur={5}>
          <p style={{ margin: 0, fontSize: 36, fontWeight: 500, color: C.accent }}>
            {COPY.v2Sub}
          </p>
        </Reveal>
      </AbsoluteFill>
    </Stage>
  );
};
