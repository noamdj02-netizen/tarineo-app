import { AbsoluteFill, Sequence } from "remotion";
import "../fonts";
import { SCENE } from "./constants";
import { AnalyseScene } from "./scenes/Analyse";
import { CopiloteScene } from "./scenes/Copilote";
import { DashboardScene } from "./scenes/Dashboard";
import { ExportComptableScene } from "./scenes/ExportComptable";
import { EcosystemScene } from "./scenes/Ecosystem";
import { LogoOutroScene } from "./scenes/LogoOutro";
import { MetiersScene } from "./scenes/Metiers";
import { TransformScene } from "./scenes/Transform";
import { UploadScene } from "./scenes/Upload";
import { V2Scene } from "./scenes/V2";

/**
 * TARINEO Product V2 — ~30 s
 * Douleur → Upload → Analyse → Copilote → Transform → Écosystème → Dashboard → Export → V2 → Logo (24 s)
 */
export const TarineoProductV2: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#F5F5F3" }}>
      <Sequence from={SCENE.metiers.from} durationInFrames={SCENE.metiers.duration} name="Metiers">
        <MetiersScene />
      </Sequence>
      <Sequence from={SCENE.upload.from} durationInFrames={SCENE.upload.duration} name="Upload">
        <UploadScene />
      </Sequence>
      <Sequence from={SCENE.analyse.from} durationInFrames={SCENE.analyse.duration} name="Analyse">
        <AnalyseScene />
      </Sequence>
      <Sequence from={SCENE.copilote.from} durationInFrames={SCENE.copilote.duration} name="Copilote">
        <CopiloteScene />
      </Sequence>
      <Sequence from={SCENE.transform.from} durationInFrames={SCENE.transform.duration} name="Transform">
        <TransformScene />
      </Sequence>
      <Sequence from={SCENE.ecosystem.from} durationInFrames={SCENE.ecosystem.duration} name="Ecosystem">
        <EcosystemScene />
      </Sequence>
      <Sequence from={SCENE.dashboard.from} durationInFrames={SCENE.dashboard.duration} name="Dashboard">
        <DashboardScene />
      </Sequence>
      <Sequence from={SCENE.export.from} durationInFrames={SCENE.export.duration} name="ExportComptable">
        <ExportComptableScene />
      </Sequence>
      <Sequence from={SCENE.v2.from} durationInFrames={SCENE.v2.duration} name="V2">
        <V2Scene />
      </Sequence>
      <Sequence from={SCENE.logo.from} durationInFrames={SCENE.logo.duration} name="Logo">
        <LogoOutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
