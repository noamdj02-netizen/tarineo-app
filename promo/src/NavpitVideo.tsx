import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill } from "remotion";
import { fontSans } from "./fonts";
import { Copilot } from "./scenes/Copilot";
import { Cta } from "./scenes/Cta";
import { Focus } from "./scenes/Focus";
import { Logo } from "./scenes/Logo";
import { Planning } from "./scenes/Planning";
import { Price } from "./scenes/Price";
import { Problem } from "./scenes/Problem";
import { Projects } from "./scenes/Projects";

const fadeIn = fade();
const timing = linearTiming({ durationInFrames: 14 });

/** Walkthrough du cockpit réel — pas un motion graphics générique. */
export const NavpitVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: fontSans }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Accueil" durationInFrames={80}>
          <Logo />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fadeIn} timing={timing} />
        <TransitionSeries.Sequence name="Probleme" durationInFrames={90}>
          <Problem />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fadeIn} timing={timing} />
        <TransitionSeries.Sequence name="Focus" durationInFrames={90}>
          <Focus />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fadeIn} timing={timing} />
        <TransitionSeries.Sequence name="Copilote" durationInFrames={130}>
          <Copilot />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fadeIn} timing={timing} />
        <TransitionSeries.Sequence name="Projets" durationInFrames={140}>
          <Projects />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fadeIn} timing={timing} />
        <TransitionSeries.Sequence name="Planning" durationInFrames={120}>
          <Planning />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fadeIn} timing={timing} />
        <TransitionSeries.Sequence name="Prix" durationInFrames={130}>
          <Price />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fadeIn} timing={timing} />
        <TransitionSeries.Sequence name="CTA" durationInFrames={100}>
          <Cta />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

export const NAVPIT_DURATION = 880 - 7 * 14;
