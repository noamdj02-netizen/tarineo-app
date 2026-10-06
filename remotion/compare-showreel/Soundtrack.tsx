import { Audio } from "@remotion/media";
import { Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SEQ_FROM, SFX_CUES } from "./constants";

const bedVolume = (frame: number, durationInFrames: number) => {
  const fadeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - 48, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse =
    0.58 +
    0.06 *
      Math.sin((frame / 30) * Math.PI * 2 * (120 / 60)) *
      interpolate(frame, [SEQ_PULSE_START, SEQ_PULSE_START + 30], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  return fadeIn * fadeOut * pulse;
};

/** Montage UI : léger swell rythmique. */
const SEQ_PULSE_START = SEQ_FROM.montageUi;

export const CompareSoundtrack: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <>
      <Audio
        src={staticFile("remotion-audio/bed.mp3")}
        loop
        volume={bedVolume(frame, durationInFrames)}
      />
      {SFX_CUES.map((cue, i) => (
        <Sequence
          key={`${cue.at}-${i}`}
          from={cue.at}
          durationInFrames={cue.frames}
          layout="none"
        >
          <Audio src={staticFile(`remotion-audio/${cue.file}`)} volume={cue.volume} />
        </Sequence>
      ))}
    </>
  );
};
