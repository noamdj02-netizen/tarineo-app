import { AbsoluteFill, Series } from "remotion";
import { fontSans } from "../fonts";
import { APPS_DURATION, Apps } from "./Apps";
import { CLOSE_DURATION, Close } from "./Close";
import { OPENING_DURATION, Opening } from "./Opening";
import { SCREENS_DURATION, Screens } from "./Screens";
import { Soundtrack } from "./Soundtrack";

export const LAUNCH_DURATION = APPS_DURATION + OPENING_DURATION + SCREENS_DURATION + CLOSE_DURATION;

/** Présentation coupée comme une page Raylight : une idée, un plan, une coupe franche. */
export const LaunchVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: fontSans }}>
      <Soundtrack />
      <Series>
        <Series.Sequence name="Applications" durationInFrames={APPS_DURATION}>
          <Apps />
        </Series.Sequence>
        <Series.Sequence name="Projet" durationInFrames={OPENING_DURATION}>
          <Opening />
        </Series.Sequence>
        <Series.Sequence name="Ecrans" durationInFrames={SCREENS_DURATION}>
          <Screens />
        </Series.Sequence>
        <Series.Sequence name="Fin" durationInFrames={CLOSE_DURATION}>
          <Close />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
