import { AbsoluteFill, CanvasImage, Easing, Interactive, interpolate, staticFile, useCurrentFrame } from "remotion";
import { fontGrotesk, fontSans } from "../fonts";
import { C } from "../theme";
import { Mesh } from "./Mesh";

export { CLOSE_DURATION } from "./timeline";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

export const Close: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ fontFamily: fontGrotesk }}>
      <Mesh />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
        }}
      >
        <CanvasImage
          name="Mark"
          src={staticFile("logo.png")}
          style={{
            width: 480,
            height: 356,
            objectFit: "contain",
            backgroundColor: "transparent",
            opacity: interpolate(frame, [4, 18], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
            }),
            scale: interpolate(frame, [4, 22], [0.86, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
              output: "perceptual-scale",
            }),
          }}
        />
        <Interactive.Div
          name="Wordmark"
          style={{
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: "-0.05em",
            color: C.ink,
            opacity: interpolate(frame, [12, 28], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
            }),
            translate: interpolate(frame, [12, 30], ["24px 0px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
            }),
          }}
        >
          Navpit
        </Interactive.Div>
      </AbsoluteFill>
      <Interactive.Div
        name="Domain"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 280,
          textAlign: "center",
          fontFamily: fontSans,
          fontSize: 36,
          color: C.ink,
          opacity: interpolate(frame, [28, 44], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          }),
        }}
      >
        navpit.com
      </Interactive.Div>
    </AbsoluteFill>
  );
};
