import { AbsoluteFill } from "remotion";
import { CopilotePanel } from "../embeds/CopilotePanel";
import { Narration } from "../components/Narration";
import { COPY } from "../data";
import { Grain, ProductShell, Stage } from "../ui";

/** Panneau Copilote — miroir de `AssistantPanel` + mascotte HD. */
export const CopiloteScene: React.FC = () => {
  return (
    <Stage>
      <Grain />
      <Narration pain={COPY.copilotePain} solution={COPY.copiloteLine} start={0} />
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 36,
        }}
      >
        <ProductShell activeNav="Accueil" width={1280} height={700} style={{ position: "relative" }} padding={14}>
          <CopilotePanel />
        </ProductShell>
      </AbsoluteFill>
    </Stage>
  );
};
