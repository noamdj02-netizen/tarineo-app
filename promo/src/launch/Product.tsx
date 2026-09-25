import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { fontGrotesk, fontSans } from "../fonts";
import { C, SHADOW_LIFT } from "../theme";

export const PRODUCT_DURATION = 132;

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const CHIPS = ["Rédiger un mail", "Schéma du parcours", "Post LinkedIn"];

export const Product: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f7f6f4",
        fontFamily: fontSans,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 36,
      }}
    >
      <Interactive.Div
        name="Eyebrow"
        style={{
          fontFamily: fontGrotesk,
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: C.ink,
          opacity: interpolate(frame, [0, 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          }),
          translate: interpolate(frame, [0, 18], ["0px 20px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          }),
        }}
      >
        Tu demandes. Il avance.
      </Interactive.Div>
      <Interactive.Div
        name="Prompt card"
        style={{
          width: 1080,
          borderRadius: 28,
          backgroundColor: C.surface,
          boxShadow: SHADOW_LIFT,
          padding: "36px 40px 28px",
          opacity: interpolate(frame, [10, 28], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          }),
          scale: interpolate(frame, [10, 36], [0.94, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
            output: "perceptual-scale",
          }),
          rotate: interpolate(frame, [10, 40], ["-6deg", "-2deg"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          }),
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: "0.12em", color: C.muted, marginBottom: 14 }}>
          BONJOUR
        </div>
        <div
          style={{
            fontFamily: fontGrotesk,
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            color: C.ink,
            marginBottom: 28,
          }}
        >
          Comment puis-je t’aider ?
        </div>
        <div
          style={{
            height: 72,
            borderRadius: 16,
            border: `1px solid ${C.line}`,
            background: C.surface2,
            marginBottom: 22,
          }}
        />
        <div style={{ display: "flex", gap: 12 }}>
          {CHIPS.map((chip, i) => (
            <div
              key={chip}
              style={{
                borderRadius: 999,
                border: `1px solid ${C.line}`,
                padding: "12px 18px",
                fontSize: 22,
                color: C.ink,
                opacity: interpolate(frame, [28 + i * 6, 40 + i * 6], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: ease,
                }),
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </Interactive.Div>
    </AbsoluteFill>
  );
};
