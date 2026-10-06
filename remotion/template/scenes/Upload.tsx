import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { UploadPanel } from "../../product-v2/embeds/UploadPanel";
import { TemplateAppInset } from "../TemplateAppInset";
import { Cursor, Stage, clamp } from "../ui";

/** 10→12.5s — import document (écran Analyse IA réel). */
export const UploadScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cursorX = interpolate(frame, [18, 50], [1180, 960], clamp);
  const cursorY = interpolate(frame, [18, 50], [680, 520], clamp);

  return (
    <Stage>
      <AbsoluteFill>
        <TemplateAppInset activeNav="Analyse IA" shellWidth={1180} shellHeight={620}>
          <UploadPanel />
        </TemplateAppInset>
      </AbsoluteFill>
      <Cursor x={cursorX} y={cursorY} opacity={interpolate(frame, [14, 24], [0, 1], clamp)} />
    </Stage>
  );
};
