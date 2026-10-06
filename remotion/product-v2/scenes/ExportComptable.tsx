import { AbsoluteFill } from "remotion";
import { ExportPanel } from "../embeds/ExportPanel";
import { Narration } from "../components/Narration";
import { COPY } from "../data";
import { Grain, ProductShell, Stage } from "../ui";

export const ExportComptableScene: React.FC = () => {
  return (
    <Stage>
      <Grain />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <Narration pain={COPY.exportPain} solution={COPY.exportLine} start={0} />

        <ProductShell activeNav="Export comptable" width={1280} height={680} padding={14}>
          <ExportPanel />
        </ProductShell>
      </AbsoluteFill>
    </Stage>
  );
};
