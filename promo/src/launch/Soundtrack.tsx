import { Audio } from "@remotion/media";
import { Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { VOICE_CUES } from "./timeline";

/** Volume calé sur le temps de la composition, pas sur la boucle du mp3. */
const bedVolume = (frame: number, durationInFrames: number) => {
  const fadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - 36, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  let duck = 0;
  for (const cue of VOICE_CUES) {
    const start = cue.from;
    const end = cue.from + cue.voiceFrames;
    if (frame < start - 8 || frame > end + 10) continue;
    const enter = interpolate(frame, [start - 8, start], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const exit = interpolate(frame, [end, end + 10], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    duck = Math.max(duck, Math.min(enter, exit));
  }
  return fadeIn * fadeOut * (0.62 - duck * 0.28);
};

/** Musique en fond, voix par-dessus. La musique baisse pendant chaque phrase, sans se taire. */
export const Soundtrack: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <>
      <Audio src={staticFile("audio/bed.mp3")} loop volume={bedVolume(frame, durationInFrames)} />
      {VOICE_CUES.map((cue) => (
        <Sequence key={cue.id} name={cue.id} from={cue.from} durationInFrames={cue.voiceFrames} layout="none">
          <Audio src={staticFile(`audio/${cue.voice}`)} premountFor={8} />
        </Sequence>
      ))}
    </>
  );
};
