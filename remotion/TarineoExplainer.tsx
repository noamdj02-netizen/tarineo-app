import { AbsoluteFill, Sequence } from "remotion";
import { COLORS, SCENE } from "./constants";
import { AnalysisScene } from "./scenes/AnalysisScene";
import { CloseScene } from "./scenes/CloseScene";
import { DetectionScene } from "./scenes/DetectionScene";
import { DocumentScene } from "./scenes/DocumentScene";
import { MarginScene } from "./scenes/MarginScene";
import "./fonts";

/**
 * Composition principale — narration 15.5 s :
 * Document → Analyse → Hausse → Marge → Logo/CTA
 */
export const TarineoExplainer: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Sequence from={SCENE.document.from} durationInFrames={SCENE.document.duration} name="Document">
        <DocumentScene />
      </Sequence>
      <Sequence from={SCENE.analysis.from} durationInFrames={SCENE.analysis.duration} name="Analyse">
        <AnalysisScene />
      </Sequence>
      <Sequence from={SCENE.detection.from} durationInFrames={SCENE.detection.duration} name="Détection">
        <DetectionScene />
      </Sequence>
      <Sequence from={SCENE.margin.from} durationInFrames={SCENE.margin.duration} name="Marge">
        <MarginScene />
      </Sequence>
      <Sequence from={SCENE.close.from} durationInFrames={SCENE.close.duration} name="Close">
        <CloseScene />
      </Sequence>
    </AbsoluteFill>
  );
};
