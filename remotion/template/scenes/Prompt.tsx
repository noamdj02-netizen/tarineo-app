import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CopiloteDevisAnalysePanel } from "../components/CopiloteDevisAnalysePanel";
import { TemplateAppInset } from "../TemplateAppInset";
import { Cursor, Stage, clamp } from "../ui";

/** 12.5→16s — l’assistant analyse le devis en entier (document + étapes). */
export const PromptScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cursorX = interpolate(frame, [78, 96], [920, 1080], clamp);
  const cursorY = interpolate(frame, [78, 96], [540, 500], clamp);

  return (
    <Stage>
      <AbsoluteFill>
        <TemplateAppInset
          activeNav="Accueil"
          shellWidth={1320}
          shellHeight={720}
          shellStyle={{ position: "relative" }}
          maxWidthRatio={0.94}
        >
          <CopiloteDevisAnalysePanel />
        </TemplateAppInset>
      </AbsoluteFill>
      <Cursor x={cursorX} y={cursorY} opacity={interpolate(frame, [74, 84], [0, 1], clamp)} />
    </Stage>
  );
};
