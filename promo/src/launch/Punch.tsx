import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { fontGrotesk } from "../fonts";

export { PUNCH_DURATION } from "./timeline";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** Le mot entier sort du flou, comme SHARED dans la référence. */
export const Punch: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f3f3f2",
        fontFamily: fontGrotesk,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Interactive.Div
        name="Punch line"
        style={{
          color: "#111111",
          fontSize: 84,
          textAlign: "center",
          padding: "0 48px",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          opacity: interpolate(frame, [0, 4, 16], [0, 0.45, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          }),
          filter: `blur(${interpolate(frame, [0, 18], [28, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          })}px)`,
        }}
      >
        Un cockpit.
      </Interactive.Div>
    </AbsoluteFill>
  );
};
