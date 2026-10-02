import { useCurrentFrame, useVideoConfig } from "remotion";
import { reveal, scaleIn, sceneOpacity } from "../animations";
import { COLORS, SCENE } from "../constants";
import { CLOSE } from "../data";
import { fontSans } from "../fonts";
import { TarineoLogoMark } from "../components/TarineoLogoMark";
import { Stage } from "../components/Stage";

const DURATION = SCENE.close.duration;

export const CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const opacity = sceneOpacity(frame, DURATION, 8);

  return (
    <Stage style={{ opacity }}>
      <div
        style={{
          ...scaleIn(frame, 2, 18),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: portrait ? 22 : 18,
        }}
      >
        <TarineoLogoMark size={portrait ? 72 : 64} variant="light" />

        <h1
          style={{
            ...reveal(frame, 8, 16, 10),
            margin: 0,
            fontFamily: fontSans,
            fontSize: portrait ? 56 : 52,
            fontWeight: 700,
            letterSpacing: "-0.055em",
            lineHeight: 1.05,
          }}
        >
          {CLOSE.brand}
        </h1>

        <p
          style={{
            ...reveal(frame, 14, 16, 8),
            margin: 0,
            maxWidth: 520,
            fontSize: portrait ? 20 : 18,
            fontWeight: 500,
            color: COLORS.muted,
            letterSpacing: "-0.02em",
            lineHeight: 1.4,
          }}
        >
          {CLOSE.tagline}
        </p>

        <div
          style={{
            ...reveal(frame, 14, 14, 10),
            marginTop: 8,
            display: "inline-flex",
            alignItems: "center",
            padding: "14px 22px",
            borderRadius: 12,
            background: COLORS.accent,
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            boxShadow: "0 8px 24px -8px rgba(236,88,33,0.55)",
          }}
        >
          {CLOSE.cta}
        </div>
      </div>
    </Stage>
  );
};
