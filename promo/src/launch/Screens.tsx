import { AbsoluteFill, CanvasImage, Easing, Interactive, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { fontGrotesk } from "../fonts";
import { C, SHADOW_LIFT } from "../theme";
import { SCREENS_DURATION, SHOTS } from "./timeline";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

export { SCREENS_DURATION };

const Shot: React.FC<{ file: string; title: string; frames: number }> = ({ file, title, frames }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: fontGrotesk }}>
      <Interactive.Div
        name="Title"
        style={{
          position: "absolute",
          top: 200,
          left: 48,
          right: 48,
          fontSize: 56,
          fontWeight: 700,
          letterSpacing: "-0.045em",
          lineHeight: 1.05,
          color: C.ink,
          textAlign: "center",
          opacity: interpolate(frame, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          }),
          translate: interpolate(frame, [0, 12], ["0px 12px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          }),
        }}
      >
        {title}
      </Interactive.Div>
      <Interactive.Div
        name="Frame"
        style={{
          position: "absolute",
          left: 24,
          top: 430,
          width: 1032,
          height: 648,
          borderRadius: 22,
          overflow: "hidden",
          backgroundColor: C.surface,
          boxShadow: SHADOW_LIFT,
          opacity: interpolate(frame, [4, 16], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          }),
        }}
      >
        <CanvasImage
          name="Screen"
          src={staticFile(`screens/${file}`)}
          style={{
            width: 1032,
            height: 648,
            objectFit: "cover",
            objectPosition: "left top",
            scale: interpolate(frame, [4, frames], [1, 1.03], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.linear,
              output: "perceptual-scale",
            }),
          }}
        />
      </Interactive.Div>
    </AbsoluteFill>
  );
};

/** Les captures réelles de l’app, une page par coupe. */
export const Screens: React.FC = () => {
  return (
    <AbsoluteFill>
      {SHOTS.map((shot, index) => (
        <Sequence
          key={shot.file}
          name={shot.id}
          from={SHOTS.slice(0, index).reduce((sum, item) => sum + item.frames, 0)}
          durationInFrames={shot.frames}
        >
          <Shot file={shot.file} title={shot.title} frames={shot.frames} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
