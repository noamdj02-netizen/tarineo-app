import { AbsoluteFill, Sequence } from "remotion";
import "../fonts";
import { SCENE } from "./constants";
import { AchatsScene } from "./scenes/Achats";
import { AssistantBTPScene } from "./scenes/AssistantBTP";
import { ArriveScene } from "./scenes/DashboardArrive";
import { DashboardHeroScene } from "./scenes/DashboardHero";
import { DevisScene } from "./scenes/Devis";
import { IntroScene } from "./scenes/Intro";
import { OutroScene } from "./scenes/Outro";
import { OverviewScene } from "./scenes/Overview";
import { ProblemScene } from "./scenes/Problem";

/**
 * Motion Dashboard TARINEO — ~30 s, 1920×1080.
 * Narration : Intro → Problème → Arrive → Hero → Devis → IA → Achats → Overview → Outro
 */
export const TarineoDashboard: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0A" }}>
      <Sequence from={SCENE.intro.from} durationInFrames={SCENE.intro.duration} name="Intro">
        <IntroScene />
      </Sequence>
      <Sequence from={SCENE.problem.from} durationInFrames={SCENE.problem.duration} name="Problem">
        <ProblemScene />
      </Sequence>
      <Sequence from={SCENE.arrive.from} durationInFrames={SCENE.arrive.duration} name="Arrive">
        <ArriveScene />
      </Sequence>
      <Sequence from={SCENE.dashboard.from} durationInFrames={SCENE.dashboard.duration} name="Dashboard">
        <DashboardHeroScene />
      </Sequence>
      <Sequence from={SCENE.devis.from} durationInFrames={SCENE.devis.duration} name="Devis">
        <DevisScene />
      </Sequence>
      <Sequence from={SCENE.assistant.from} durationInFrames={SCENE.assistant.duration} name="Assistant">
        <AssistantBTPScene />
      </Sequence>
      <Sequence from={SCENE.achats.from} durationInFrames={SCENE.achats.duration} name="Achats">
        <AchatsScene />
      </Sequence>
      <Sequence from={SCENE.overview.from} durationInFrames={SCENE.overview.duration} name="Overview">
        <OverviewScene />
      </Sequence>
      <Sequence from={SCENE.outro.from} durationInFrames={SCENE.outro.duration} name="Outro">
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
