import { Composition, Folder } from "remotion";
import { NAVPIT_DURATION, NavpitVideo } from "./NavpitVideo";
import { Copilot } from "./scenes/Copilot";
import { Cta } from "./scenes/Cta";
import { Focus } from "./scenes/Focus";
import { Logo } from "./scenes/Logo";
import { Planning } from "./scenes/Planning";
import { Price } from "./scenes/Price";
import { Problem } from "./scenes/Problem";
import { Projects } from "./scenes/Projects";

const SIZE = { width: 1920, height: 1080, fps: 30 } as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Navpit" component={NavpitVideo} durationInFrames={NAVPIT_DURATION} {...SIZE} />
      <Folder name="Scenes">
        <Composition id="Logo" component={Logo} durationInFrames={80} {...SIZE} />
        <Composition id="Problem" component={Problem} durationInFrames={90} {...SIZE} />
        <Composition id="Focus" component={Focus} durationInFrames={90} {...SIZE} />
        <Composition id="Copilot" component={Copilot} durationInFrames={130} {...SIZE} />
        <Composition id="Projects" component={Projects} durationInFrames={140} {...SIZE} />
        <Composition id="Planning" component={Planning} durationInFrames={120} {...SIZE} />
        <Composition id="Price" component={Price} durationInFrames={130} {...SIZE} />
        <Composition id="Cta" component={Cta} durationInFrames={100} {...SIZE} />
      </Folder>
    </>
  );
};
