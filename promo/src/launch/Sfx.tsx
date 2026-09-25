import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";

/** Bruitage court, calé sur une image. */
export const Sfx: React.FC<{ file: string; at: number; frames: number; volume?: number }> = ({
  file,
  at,
  frames,
  volume = 0.35,
}) => {
  return (
    <Sequence from={at} durationInFrames={Math.max(frames, 12)} layout="none">
      <Audio src={staticFile(`audio/${file}`)} volume={volume} />
    </Sequence>
  );
};
