import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { countFloat, reveal, sceneOpacity } from "../animations";
import { COLORS, SCENE } from "../constants";
import { DETECTION } from "../data";
import { fontMono, fontSans } from "../fonts";
import { Sparkline } from "../components/Charts";
import { MonoLabel, Stage, SurfaceCard } from "../components/Stage";

const DURATION = SCENE.detection.duration;

export const DetectionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const opacity = sceneOpacity(frame, DURATION, 14);

  const pct = countFloat(frame, 22, 36, DETECTION.pct, 1);
  const barW = interpolate(frame, [28, 60], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Stage style={{ opacity }}>
      <div style={{ ...reveal(frame, 0, 14, 8), textAlign: "center" }}>
        <MonoLabel>Détection</MonoLabel>
      </div>

      <SurfaceCard
        lift
        style={{
          ...reveal(frame, 4, 18, 16),
          width: "100%",
          maxWidth: portrait ? 780 : 720,
          padding: portrait ? "36px 36px 32px" : "40px 48px 36px",
        }}
      >
        <div
          style={{
            fontFamily: fontSans,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: COLORS.muted,
            marginBottom: 8,
          }}
        >
          {DETECTION.product}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: portrait ? "1fr" : "1fr 1fr",
            gap: portrait ? 20 : 32,
            alignItems: "end",
            marginTop: 20,
          }}
        >
          <div style={reveal(frame, 10, 16, 10)}>
            <div
              style={{
                fontFamily: fontMono,
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: COLORS.muted,
                marginBottom: 8,
              }}
            >
              Ancien prix
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "-0.04em",
                color: COLORS.muted,
                textDecoration: "line-through",
                textDecorationColor: "rgba(110,110,110,0.45)",
              }}
            >
              {DETECTION.oldPrice}
            </div>
          </div>

          <div style={reveal(frame, 18, 16, 10)}>
            <div
              style={{
                fontFamily: fontMono,
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: COLORS.muted,
                marginBottom: 8,
              }}
            >
              Nouveau prix
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "-0.05em",
              }}
            >
              {DETECTION.newPrice}
            </div>
          </div>
        </div>

        <div
          style={{
            ...reveal(frame, 28, 18, 12),
            marginTop: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                fontSize: portrait ? 64 : 72,
                fontWeight: 700,
                letterSpacing: "-0.06em",
                lineHeight: 1,
                color: COLORS.accent,
              }}
            >
              +{pct.toFixed(1)} %
            </div>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 99,
                background: COLORS.accent,
                boxShadow: "0 0 0 6px rgba(236,88,33,0.14)",
              }}
            />
          </div>
          <Sparkline frame={frame} start={32} width={180} height={52} accent />
        </div>

        <div
          style={{
            marginTop: 28,
            height: 6,
            borderRadius: 99,
            background: COLORS.bg,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${barW}%`,
              height: "100%",
              borderRadius: 99,
              background: COLORS.accent,
            }}
          />
        </div>

        <div
          style={{
            ...reveal(frame, 48, 16, 8),
            marginTop: 22,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 14px",
            borderRadius: 10,
            background: COLORS.accentSoft,
            color: COLORS.accent,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          Hausse détectée
        </div>
      </SurfaceCard>
    </Stage>
  );
};
