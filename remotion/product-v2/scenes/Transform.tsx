import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { C, SHADOW } from "../constants";
import { COPY, TRANSFORM_STEPS } from "../data";
import { Narration } from "../components/Narration";
import { Grain, Reveal, SoftCard, Stage } from "../ui";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

export const TransformScene: React.FC = () => {
  const frame = useCurrentFrame();
  const step = Math.min(
    TRANSFORM_STEPS.length - 1,
    Math.max(0, Math.floor((frame - 8) / 24)),
  );
  const local = (frame - 8) % 24;
  const morph = interpolate(local, [0, 14], [0, 1], clamp);
  const cardScale = interpolate(morph, [0, 0.5, 1], [1, 0.97, 1], clamp);

  return (
    <Stage>
      <Narration pain="Recopier les lignes à la main." solution={COPY.transformLine} start={0} />
      <Grain />
      <AbsoluteFill
        style={{ paddingTop: 36 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {TRANSFORM_STEPS.map((label, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    minWidth: 148,
                    padding: "16px 14px",
                    borderRadius: 14,
                    textAlign: "center",
                    background: active ? C.ink : C.white,
                    color: active ? C.white : C.ink,
                    border: `1px solid ${active ? C.ink : C.border}`,
                    boxShadow: SHADOW,
                    opacity: i <= step ? 1 : 0.32,
                    transform: `scale(${active ? 1.05 : 1})`,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    fontSize: 13,
                  }}
                >
                  {label}
                </div>
                {i < TRANSFORM_STEPS.length - 1 ? (
                  <span
                    style={{
                      color: C.accent,
                      fontWeight: 700,
                      opacity: done || active ? 1 : 0.25,
                      fontSize: 18,
                    }}
                  >
                    ↓
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        <SoftCard
          style={{
            width: 540,
            height: 300,
            padding: 28,
            transform: `scale(${cardScale})`,
            clipPath: `inset(${interpolate(morph, [0, 1], [4, 0], clamp)}% round 16px)`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ margin: 0, fontSize: 12, color: C.accent, fontWeight: 700, letterSpacing: "0.1em" }}>
              {TRANSFORM_STEPS[step]}
            </p>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 8,
                background: C.canvas,
                color: C.muted,
                border: `1px solid ${C.border}`,
              }}
            >
              Document TARINEO
            </span>
          </div>

          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: 14,
                  borderRadius: 8,
                  width: `${52 + ((i + step) % 4) * 11}%`,
                  background: step >= 1 && i === 1 ? C.accentSoft : "rgba(10,10,10,0.07)",
                }}
              />
            ))}
          </div>

          {step >= 2 ? (
            <p style={{ margin: "24px 0 0", fontSize: 13, color: C.muted }}>
              Structure prête · à vérifier avant envoi
            </p>
          ) : null}
          {step >= 3 ? (
            <div
              style={{
                marginTop: 16,
                display: "inline-flex",
                padding: "8px 12px",
                borderRadius: 10,
                background: "rgba(22,163,74,0.1)",
                color: "#16A34A",
                fontSize: 13,
                fontWeight: 650,
              }}
            >
              Facture prête
            </div>
          ) : null}
        </SoftCard>
      </AbsoluteFill>
    </Stage>
  );
};
