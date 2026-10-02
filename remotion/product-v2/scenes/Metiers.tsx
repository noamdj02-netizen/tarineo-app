import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE } from "../../animations";
import { C, SHADOW } from "../constants";
import { COPY, PAIN_LINES } from "../data";
import { PainCard } from "../components/Narration";
import { Grain, HdMascot, Reveal, Stage } from "../ui";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

export const MetiersScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const converge = spring({
    frame: frame - 32,
    fps,
    config: { damping: 20, stiffness: 140, mass: 0.75 },
  });

  return (
    <Stage>
      <Grain />
      <AbsoluteFill>
        <div style={{ position: "absolute", left: 72, top: 120, display: "flex", flexDirection: "column", gap: 10, maxWidth: 520 }}>
          {PAIN_LINES.map((line, i) => {
            const enter = spring({ frame: frame - (4 + i * 7), fps, config: { damping: 18, stiffness: 160 } });
            return (
              <div key={line} style={{ opacity: enter, transform: `translateX(${interpolate(enter, [0, 1], [-24, 0])}px)` }}>
                <PainCard tone="pain">{line}</PainCard>
              </div>
            );
          })}
        </div>

        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: 40,
            opacity: interpolate(frame, [8, 22], [0, 1], clamp),
            transform: `translateY(${interpolate(frame, [8, 22], [20, 0], clamp)}px)`,
          }}
        >
          <HdMascot pose="06-loupe" size={280} />
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "42%",
            transform: `translate(-50%, -50%) scale(${interpolate(converge, [0.4, 1], [0.92, 1], clamp)})`,
            opacity: interpolate(converge, [0.35, 0.9], [0, 1], clamp),
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: C.ink,
              color: C.white,
              borderRadius: 16,
              padding: "16px 32px",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.14em",
              boxShadow: SHADOW,
              marginBottom: 14,
            }}
          >
            TARINEO
          </div>
          <p style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", color: C.ink }}>{COPY.painHook}</p>
        </div>

        <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, textAlign: "center" }}>
          <Reveal start={48} duration={12} y={10}>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 550, color: C.muted }}>{COPY.metierLine}</p>
          </Reveal>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
