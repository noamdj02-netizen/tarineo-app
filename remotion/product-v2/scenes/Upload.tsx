import { AbsoluteFill } from "remotion";
import { COPY } from "../data";
import { UploadPanel } from "../embeds/UploadPanel";
import { Narration } from "../components/Narration";
import { Grain, ProductShell, Stage } from "../ui";

export const UploadScene: React.FC = () => {
  return (
    <Stage>
      <Grain />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <Narration pain={COPY.uploadPain} solution={COPY.uploadLine} start={0} />

        <ProductShell activeNav="Analyse IA" width={1180} height={620} padding={16}>
          <UploadPanel />
        </ProductShell>
      </AbsoluteFill>
    </Stage>
  );
};
