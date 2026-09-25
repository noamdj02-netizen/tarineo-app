import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";

/** Halo pêche / lilas / bleu du hero, le même geste que la landing. */
export const Mesh: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: "-18%",
          top: "28%",
          width: 720,
          height: 720,
          borderRadius: "50%",
          background: C.glow1,
          filter: "blur(80px)",
          opacity: 0.85,
          translate: interpolate(frame, [0, 120], ["0px 40px", "40px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.linear,
          }),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "18%",
          top: "38%",
          width: 820,
          height: 820,
          borderRadius: "50%",
          background: C.glow2,
          filter: "blur(90px)",
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "-22%",
          top: "48%",
          width: 720,
          height: 720,
          borderRadius: "50%",
          background: C.glow3,
          filter: "blur(80px)",
          opacity: 0.9,
          translate: interpolate(frame, [0, 120], ["0px 20px", "-30px -10px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.linear,
          }),
        }}
      />
    </AbsoluteFill>
  );
};
