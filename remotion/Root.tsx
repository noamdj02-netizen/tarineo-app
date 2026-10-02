import { Composition, Folder } from "remotion";
import {
  COMPOSITION,
  DURATION_IN_FRAMES,
  FPS,
  SCENE,
} from "./constants";
import {
  COMPOSITION_ID as DASHBOARD_ID,
  DURATION_IN_FRAMES as DASHBOARD_DURATION,
  FPS as DASHBOARD_FPS,
  SCENE as DASH_SCENE,
  SIZE as DASHBOARD_SIZE,
} from "./dashboard-motion/constants";
import { TarineoDashboard } from "./dashboard-motion/TarineoDashboard";
import { IntroScene } from "./dashboard-motion/scenes/Intro";
import { ProblemScene } from "./dashboard-motion/scenes/Problem";
import { ArriveScene } from "./dashboard-motion/scenes/DashboardArrive";
import { DashboardHeroScene } from "./dashboard-motion/scenes/DashboardHero";
import { DevisScene } from "./dashboard-motion/scenes/Devis";
import { AssistantBTPScene } from "./dashboard-motion/scenes/AssistantBTP";
import { AchatsScene } from "./dashboard-motion/scenes/Achats";
import { OverviewScene } from "./dashboard-motion/scenes/Overview";
import { OutroScene } from "./dashboard-motion/scenes/Outro";
import {
  DURATION as PRODUCT_DURATION,
  FPS as PRODUCT_FPS,
  ID as PRODUCT_ID,
  ID_4K as PRODUCT_ID_4K,
  SCENE as PRODUCT_SCENE,
  SIZE as PRODUCT_SIZE,
  SIZE_4K as PRODUCT_SIZE_4K,
} from "./product-v2/constants";
import { TarineoProductV2 } from "./product-v2/TarineoProductV2";
import { MetiersScene } from "./product-v2/scenes/Metiers";
import { UploadScene } from "./product-v2/scenes/Upload";
import { AnalyseScene } from "./product-v2/scenes/Analyse";
import { CopiloteScene } from "./product-v2/scenes/Copilote";
import { TransformScene } from "./product-v2/scenes/Transform";
import { EcosystemScene } from "./product-v2/scenes/Ecosystem";
import { DashboardScene as ProductDashboardScene } from "./product-v2/scenes/Dashboard";
import { ExportComptableScene } from "./product-v2/scenes/ExportComptable";
import { V2Scene } from "./product-v2/scenes/V2";
import { LogoOutroScene } from "./product-v2/scenes/LogoOutro";
import {
  DURATION as TEMPLATE_DURATION,
  FPS as TEMPLATE_FPS,
  ID as TEMPLATE_ID,
  ID_4K as TEMPLATE_ID_4K,
  SCENE as TEMPLATE_SCENE,
  SIZE as TEMPLATE_SIZE,
  SIZE_4K as TEMPLATE_SIZE_4K,
} from "./template/constants";
import { TarineoTemplate } from "./template/TarineoTemplate";
import { CirclesScene } from "./template/scenes/Circles";
import { UnlockScene, UnlockVideoScene } from "./template/scenes/Unlock";
import { MutateScene, PortraitsScene } from "./template/scenes/Cards";
import { WaitingScene as TemplateWaitingScene } from "./template/scenes/Waiting";
import { UploadScene as TemplateUploadScene } from "./template/scenes/Upload";
import { PromptScene } from "./template/scenes/Prompt";
import {
  LogoArcsScene,
  LogoEndScene,
  MakeSimpleScene,
  SpinnerScene,
  StartNowScene,
} from "./template/scenes/MakeSimple";
import { TarineoExplainer } from "./TarineoExplainer";
import { AnalysisScene } from "./scenes/AnalysisScene";
import { CloseScene } from "./scenes/CloseScene";
import { DetectionScene } from "./scenes/DetectionScene";
import { DocumentScene } from "./scenes/DocumentScene";
import { MarginScene } from "./scenes/MarginScene";

const landscape = {
  width: COMPOSITION.landscape.width,
  height: COMPOSITION.landscape.height,
  fps: FPS,
} as const;

const portrait = {
  width: COMPOSITION.portrait.width,
  height: COMPOSITION.portrait.height,
  fps: FPS,
} as const;

const dashboard = {
  width: DASHBOARD_SIZE.width,
  height: DASHBOARD_SIZE.height,
  fps: DASHBOARD_FPS,
} as const;

const product = {
  width: PRODUCT_SIZE.width,
  height: PRODUCT_SIZE.height,
  fps: PRODUCT_FPS,
} as const;

const product4k = {
  width: PRODUCT_SIZE_4K.width,
  height: PRODUCT_SIZE_4K.height,
  fps: PRODUCT_FPS,
} as const;

const template = {
  width: TEMPLATE_SIZE.width,
  height: TEMPLATE_SIZE.height,
  fps: TEMPLATE_FPS,
} as const;

const template4k = {
  width: TEMPLATE_SIZE_4K.width,
  height: TEMPLATE_SIZE_4K.height,
  fps: TEMPLATE_FPS,
} as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={TEMPLATE_ID}
        component={TarineoTemplate}
        durationInFrames={TEMPLATE_DURATION}
        {...template}
      />
      <Composition
        id={TEMPLATE_ID_4K}
        component={TarineoTemplate}
        durationInFrames={TEMPLATE_DURATION}
        {...template4k}
      />
      <Composition
        id={PRODUCT_ID}
        component={TarineoProductV2}
        durationInFrames={PRODUCT_DURATION}
        {...product}
      />
      <Composition
        id={PRODUCT_ID_4K}
        component={TarineoProductV2}
        durationInFrames={PRODUCT_DURATION}
        {...product4k}
      />
      <Composition
        id={DASHBOARD_ID}
        component={TarineoDashboard}
        durationInFrames={DASHBOARD_DURATION}
        {...dashboard}
      />
      <Composition
        id={COMPOSITION.landscape.id}
        component={TarineoExplainer}
        durationInFrames={DURATION_IN_FRAMES}
        {...landscape}
      />
      <Composition
        id={COMPOSITION.portrait.id}
        component={TarineoExplainer}
        durationInFrames={DURATION_IN_FRAMES}
        {...portrait}
      />
      <Folder name="Template-Scenes">
        <Composition id="TCircles" component={CirclesScene} durationInFrames={TEMPLATE_SCENE.circles.duration} {...template} />
        <Composition id="TUnlock" component={UnlockScene} durationInFrames={TEMPLATE_SCENE.unlock.duration} {...template} />
        <Composition id="TUnlockVideo" component={UnlockVideoScene} durationInFrames={TEMPLATE_SCENE.unlockVideo.duration} {...template} />
        <Composition id="TPortraits" component={PortraitsScene} durationInFrames={TEMPLATE_SCENE.portraits.duration} {...template} />
        <Composition id="TMutate" component={MutateScene} durationInFrames={TEMPLATE_SCENE.mutate.duration} {...template} />
        <Composition id="TWaiting" component={TemplateWaitingScene} durationInFrames={TEMPLATE_SCENE.waiting.duration} {...template} />
        <Composition id="TUpload" component={TemplateUploadScene} durationInFrames={TEMPLATE_SCENE.upload.duration} {...template} />
        <Composition id="TPrompt" component={PromptScene} durationInFrames={TEMPLATE_SCENE.prompt.duration} {...template} />
        <Composition id="TSpinner" component={SpinnerScene} durationInFrames={TEMPLATE_SCENE.spinner.duration} {...template} />
        <Composition id="TMakeSimple" component={MakeSimpleScene} durationInFrames={TEMPLATE_SCENE.makeSimple.duration} {...template} />
        <Composition id="TStartNow" component={StartNowScene} durationInFrames={TEMPLATE_SCENE.startNow.duration} {...template} />
        <Composition id="TLogoArcs" component={LogoArcsScene} durationInFrames={TEMPLATE_SCENE.logoArcs.duration} {...template} />
        <Composition id="TLogoEnd" component={LogoEndScene} durationInFrames={TEMPLATE_SCENE.logoEnd.duration} {...template} />
      </Folder>
      <Folder name="Product-V2-Scenes">
        <Composition id="P2Metiers" component={MetiersScene} durationInFrames={PRODUCT_SCENE.metiers.duration} {...product} />
        <Composition id="P2Upload" component={UploadScene} durationInFrames={PRODUCT_SCENE.upload.duration} {...product} />
        <Composition id="P2Analyse" component={AnalyseScene} durationInFrames={PRODUCT_SCENE.analyse.duration} {...product} />
        <Composition id="P2Copilote" component={CopiloteScene} durationInFrames={PRODUCT_SCENE.copilote.duration} {...product} />
        <Composition id="P2Transform" component={TransformScene} durationInFrames={PRODUCT_SCENE.transform.duration} {...product} />
        <Composition id="P2Ecosystem" component={EcosystemScene} durationInFrames={PRODUCT_SCENE.ecosystem.duration} {...product} />
        <Composition id="P2Dashboard" component={ProductDashboardScene} durationInFrames={PRODUCT_SCENE.dashboard.duration} {...product} />
        <Composition id="P2Export" component={ExportComptableScene} durationInFrames={PRODUCT_SCENE.export.duration} {...product} />
        <Composition id="P2V2" component={V2Scene} durationInFrames={PRODUCT_SCENE.v2.duration} {...product} />
        <Composition id="P2Logo" component={LogoOutroScene} durationInFrames={PRODUCT_SCENE.logo.duration} {...product} />
      </Folder>
      <Folder name="Dashboard-Scenes">
        <Composition id="DashIntro" component={IntroScene} durationInFrames={DASH_SCENE.intro.duration} {...dashboard} />
        <Composition id="DashProblem" component={ProblemScene} durationInFrames={DASH_SCENE.problem.duration} {...dashboard} />
        <Composition id="DashArrive" component={ArriveScene} durationInFrames={DASH_SCENE.arrive.duration} {...dashboard} />
        <Composition id="DashHero" component={DashboardHeroScene} durationInFrames={DASH_SCENE.dashboard.duration} {...dashboard} />
        <Composition id="DashDevis" component={DevisScene} durationInFrames={DASH_SCENE.devis.duration} {...dashboard} />
        <Composition id="DashAssistant" component={AssistantBTPScene} durationInFrames={DASH_SCENE.assistant.duration} {...dashboard} />
        <Composition id="DashAchats" component={AchatsScene} durationInFrames={DASH_SCENE.achats.duration} {...dashboard} />
        <Composition id="DashOverview" component={OverviewScene} durationInFrames={DASH_SCENE.overview.duration} {...dashboard} />
        <Composition id="DashOutro" component={OutroScene} durationInFrames={DASH_SCENE.outro.duration} {...dashboard} />
      </Folder>
      <Folder name="Tarineo-Scenes">
        <Composition id="Document" component={DocumentScene} durationInFrames={SCENE.document.duration} {...landscape} />
        <Composition id="Analysis" component={AnalysisScene} durationInFrames={SCENE.analysis.duration} {...landscape} />
        <Composition id="Detection" component={DetectionScene} durationInFrames={SCENE.detection.duration} {...landscape} />
        <Composition id="Margin" component={MarginScene} durationInFrames={SCENE.margin.duration} {...landscape} />
        <Composition id="Close" component={CloseScene} durationInFrames={SCENE.close.duration} {...landscape} />
      </Folder>
    </>
  );
};
