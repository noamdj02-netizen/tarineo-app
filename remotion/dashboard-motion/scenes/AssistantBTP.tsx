import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { fontSans } from "../../fonts";
import { Grain, TextReveal } from "../components/Atmosphere";
import { COLORS, SHADOW } from "../constants";
import { IA_LINES, IA_PROMPT } from "../data";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

export const AssistantBTPScene: React.FC = () => {
  const frame = useCurrentFrame();
  const typed = Math.floor(interpolate(frame, [8, 48], [0, IA_PROMPT.length], clamp));
  const prompt = IA_PROMPT.slice(0, typed);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.canvas, fontFamily: fontSans }}>
      <Grain opacity={0.02} />
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
        }}
      >
        <div
          style={{
            width: 980,
            background: COLORS.white,
            borderRadius: 24,
            border: `1px solid ${COLORS.border}`,
            boxShadow: SHADOW,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              borderBottom: `1px solid ${COLORS.border}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: COLORS.accent,
              }}
            />
            <p style={{ margin: 0, fontSize: 15, fontWeight: 650 }}>Assistant BTP</p>
            <p style={{ margin: 0, marginLeft: "auto", fontSize: 12, color: COLORS.muted }}>
              Structure · sans inventer les prix
            </p>
          </div>

          <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 22 }}>
            <div
              style={{
                alignSelf: "flex-end",
                maxWidth: "78%",
                background: COLORS.dark,
                color: COLORS.white,
                borderRadius: "18px 18px 6px 18px",
                padding: "14px 18px",
                fontSize: 17,
                lineHeight: 1.45,
                minHeight: 52,
              }}
            >
              {prompt}
              <span
                style={{
                  opacity: frame % 20 < 12 ? 1 : 0,
                  color: COLORS.accent,
                }}
              >
                |
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {IA_LINES.map((line, i) => {
                const start = 54 + i * 12;
                const op = interpolate(frame, [start, start + 14], [0, 1], clamp);
                const x = interpolate(frame, [start, start + 14], [16, 0], clamp);
                return (
                  <div
                    key={line.label}
                    style={{
                      opacity: op,
                      transform: `translateX(${x}px)`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 16px",
                      borderRadius: 12,
                      border: `1px solid ${COLORS.border}`,
                      background: COLORS.canvas,
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 600 }}>{line.label}</span>
                    <span style={{ fontSize: 14, color: COLORS.muted }}>{line.qty}</span>
                  </div>
                );
              })}
            </div>

            <TextReveal start={100} duration={16} distance={10} blur={4}>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 600,
                  color: COLORS.accent,
                }}
              >
                Proposition prête à vérifier
              </p>
            </TextReveal>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
