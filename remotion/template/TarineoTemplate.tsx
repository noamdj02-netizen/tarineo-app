import { AbsoluteFill, Sequence } from "remotion";
import "../fonts";
import { SCENE } from "./constants";
import { MutateScene, PortraitsScene } from "./scenes/Cards";
import { CirclesScene } from "./scenes/Circles";
import {
  LogoArcsScene,
  LogoEndScene,
  MakeSimpleScene,
  SpinnerScene,
  StartNowScene,
} from "./scenes/MakeSimple";
import { PromptScene } from "./scenes/Prompt";
import { UnlockScene, UnlockVideoScene } from "./scenes/Unlock";
import { UploadScene } from "./scenes/Upload";
import { WaitingScene } from "./scenes/Waiting";

/**
 * Adaptation fidèle de preview_540p_crf22 (~25 s).
 * Même rythme / compositions / mouvements — assets & couleurs TARINEO.
 */
export const TarineoTemplate: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#F5F5F3" }}>
      <Sequence from={SCENE.circles.from} durationInFrames={SCENE.circles.duration} name="Circles">
        <CirclesScene />
      </Sequence>
      <Sequence from={SCENE.unlock.from} durationInFrames={SCENE.unlock.duration} name="Unlock">
        <UnlockScene />
      </Sequence>
      <Sequence from={SCENE.unlockVideo.from} durationInFrames={SCENE.unlockVideo.duration} name="UnlockVideo">
        <UnlockVideoScene />
      </Sequence>
      <Sequence from={SCENE.portraits.from} durationInFrames={SCENE.portraits.duration} name="Portraits">
        <PortraitsScene />
      </Sequence>
      <Sequence from={SCENE.mutate.from} durationInFrames={SCENE.mutate.duration} name="Mutate">
        <MutateScene />
      </Sequence>
      <Sequence from={SCENE.waiting.from} durationInFrames={SCENE.waiting.duration} name="Waiting">
        <WaitingScene />
      </Sequence>
      <Sequence from={SCENE.upload.from} durationInFrames={SCENE.upload.duration} name="Upload">
        <UploadScene />
      </Sequence>
      <Sequence from={SCENE.prompt.from} durationInFrames={SCENE.prompt.duration} name="Prompt">
        <PromptScene />
      </Sequence>
      <Sequence from={SCENE.spinner.from} durationInFrames={SCENE.spinner.duration} name="Spinner">
        <SpinnerScene />
      </Sequence>
      <Sequence from={SCENE.makeSimple.from} durationInFrames={SCENE.makeSimple.duration} name="MakeSimple">
        <MakeSimpleScene />
      </Sequence>
      <Sequence from={SCENE.startNow.from} durationInFrames={SCENE.startNow.duration} name="StartNow">
        <StartNowScene />
      </Sequence>
      <Sequence from={SCENE.logoArcs.from} durationInFrames={SCENE.logoArcs.duration} name="LogoArcs">
        <LogoArcsScene />
      </Sequence>
      <Sequence from={SCENE.logoEnd.from} durationInFrames={SCENE.logoEnd.duration} name="LogoEnd">
        <LogoEndScene />
      </Sequence>
    </AbsoluteFill>
  );
};
