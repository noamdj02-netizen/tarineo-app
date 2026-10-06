import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnalysePanel } from "../../product-v2/embeds/AnalysePanel";
import { HaussesPanel } from "../../product-v2/embeds/HaussesPanel";
import { DocumentTransformCard } from "../components/DocumentTransformCard";
import { DevisDocMock } from "../components/DevisDocMock";
import { C, SHADOW } from "../constants";
import { DEVIS_SAMPLES } from "../data";
import { TemplateAppCrop, TemplateAppInset } from "../TemplateAppInset";
import { Stage, clamp } from "../ui";

const SIZE = 292;

/** 4.5→7.0s — écran Hausses (app réelle). */
export const PortraitsScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Stage>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 40% 35% at 50% 50%, rgba(255,180,120,0.22) 0%, rgba(140,200,160,0.12) 40%, transparent 70%)",
          opacity: interpolate(frame, [0, 16], [0, 1], clamp),
        }}
      />
      <AbsoluteFill>
        <TemplateAppInset activeNav="Hausses" shellWidth={1280} shellHeight={720} maxHeightRatio={0.86}>
          <HaussesPanel />
        </TemplateAppInset>
      </AbsoluteFill>
    </Stage>
  );
};

/** 7.0→8.5s — analyse IA (crop) + métier + sparkle. */
export const MutateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spark = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 110 } });
  const [, , right] = DEVIS_SAMPLES;
  const leftEnter = spring({ frame: frame - 2, fps, config: { damping: 16, stiffness: 130 } });

  return (
    <Stage>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: SHADOW,
            opacity: leftEnter,
            scale: interpolate(leftEnter, [0, 1], [0.92, 1], clamp),
          }}
        >
          <TemplateAppCrop
            activeNav="Analyse IA"
            shellWidth={1280}
            shellHeight={700}
            cropWidth={SIZE}
            cropHeight={SIZE}
            offsetX={-8}
            offsetY={-12}
          >
            <AnalysePanel />
          </TemplateAppCrop>
        </div>

        <DocumentTransformCard size={SIZE} />

        <div
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: SHADOW,
            background: C.white,
            position: "relative",
            display: "grid",
            placeItems: "center",
          }}
        >
          <DevisDocMock sample={right} dimmed style={{ position: "absolute", inset: 0, opacity: 0.5 }} />
          <svg
            width={110}
            height={110}
            viewBox="0 0 120 120"
            style={{
              transform: `scale(${0.55 + spark * 0.45}) rotate(${spark * 18}deg)`,
              opacity: spark,
              zIndex: 2,
            }}
          >
            <path d="M60 6 L70 46 L110 60 L70 74 L60 114 L50 74 L10 60 L50 46 Z" fill={C.accent} />
          </svg>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
