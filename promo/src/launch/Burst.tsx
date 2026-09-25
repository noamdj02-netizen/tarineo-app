import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { fontGrotesk, fontMono } from "../fonts";
import { C } from "../theme";

export { BURST_DURATION } from "./timeline";

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const SNAP = 26;

/** Sept projets, puis un seul. Le chiffre change d’un coup. */
export const Burst: React.FC = () => {
  const frame = useCurrentFrame();
  const seven = frame < SNAP;
  const local = seven ? frame : frame - SNAP;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000", fontFamily: fontGrotesk }}>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          scale: interpolate(frame, [SNAP, SNAP + 5, SNAP + 14], [1, 1.045, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
            output: "perceptual-scale",
          }),
        }}
      >
        <Interactive.Div
          name="Kicker"
          style={{
            fontFamily: fontMono,
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: "0.22em",
            color: seven ? "#8a8a8a" : C.focus,
            opacity: interpolate(local, [2, 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
            }),
            translate: interpolate(local, [0, 12], ["0px 16px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
            }),
          }}
        >
          {seven ? "PROJETS" : "EN FOCUS"}
        </Interactive.Div>
        <Interactive.Div
          name="Count"
          style={{
            fontSize: 420,
            fontWeight: 700,
            letterSpacing: "-0.07em",
            lineHeight: 0.8,
            color: "#ffffff",
            opacity: interpolate(local, [0, 6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(local, [0, 14], [seven ? 1.28 : 1.45, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
              output: "perceptual-scale",
            }),
          }}
        >
          {seven ? "7" : "1"}
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
