import { Composition, Folder } from "remotion";
import { Close, CLOSE_DURATION } from "./launch/Close";
import { LAUNCH_DURATION, LaunchVideo } from "./launch/LaunchVideo";
import { APPS_DURATION, Apps } from "./launch/Apps";
import { BURST_DURATION, Burst } from "./launch/Burst";
import { Opening, OPENING_DURATION } from "./launch/Opening";
import { Punch, PUNCH_DURATION } from "./launch/Punch";
import { SCREENS_DURATION, Screens } from "./launch/Screens";
import { NAVPIT_DURATION, NavpitVideo } from "./NavpitVideo";
import { Copilot } from "./scenes/Copilot";
import { Cta } from "./scenes/Cta";
import { Focus } from "./scenes/Focus";
import { Logo } from "./scenes/Logo";
import { Planning } from "./scenes/Planning";
import { Price } from "./scenes/Price";
import { Problem } from "./scenes/Problem";
import { Projects } from "./scenes/Projects";

const WIDE = { width: 1920, height: 1080, fps: 30 } as const;
const STORY = { width: 1080, height: 1920, fps: 30 } as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Navpit" component={NavpitVideo} durationInFrames={NAVPIT_DURATION} {...WIDE} />
      <Composition id="Launch" component={LaunchVideo} durationInFrames={LAUNCH_DURATION} {...STORY} />
      <Folder name="Launch-Scenes">
        <Composition id="LaunchApps" component={Apps} durationInFrames={APPS_DURATION} {...STORY} />
        <Composition id="LaunchBurst" component={Burst} durationInFrames={BURST_DURATION} {...STORY} />
        <Composition id="LaunchOpening" component={Opening} durationInFrames={OPENING_DURATION} {...STORY} />
        <Composition id="LaunchPunch" component={Punch} durationInFrames={PUNCH_DURATION} {...STORY} />
        <Composition id="LaunchScreens" component={Screens} durationInFrames={SCREENS_DURATION} {...STORY} />
        <Composition id="LaunchClose" component={Close} durationInFrames={CLOSE_DURATION} {...STORY} />
      </Folder>
      <Folder name="Scenes">
        <Composition id="Logo" component={Logo} durationInFrames={80} {...WIDE} />
        <Composition id="Problem" component={Problem} durationInFrames={90} {...WIDE} />
        <Composition id="Focus" component={Focus} durationInFrames={90} {...WIDE} />
        <Composition id="Copilot" component={Copilot} durationInFrames={130} {...WIDE} />
        <Composition id="Projects" component={Projects} durationInFrames={140} {...WIDE} />
        <Composition id="Planning" component={Planning} durationInFrames={120} {...WIDE} />
        <Composition id="Price" component={Price} durationInFrames={130} {...WIDE} />
        <Composition id="Cta" component={Cta} durationInFrames={100} {...WIDE} />
      </Folder>
    </>
  );
};
