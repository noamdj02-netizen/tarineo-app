import type { CSSProperties } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { countFloat, reveal, sceneOpacity } from "../animations";
import { COLORS, SCENE } from "../constants";
import { MARGIN } from "../data";
import { fontMono, fontSans } from "../fonts";
import { MarginBars } from "../components/Charts";
import { MonoLabel, Stage, SurfaceCard } from "../components/Stage";

const DURATION = SCENE.margin.duration;

export const MarginScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const opacity = sceneOpacity(frame, DURATION, 14);

  const before = countFloat(frame, 12, 28, MARGIN.before, 1);
  const after = countFloat(frame, 24, 32, MARGIN.after, 1);
  const delta = countFloat(frame, 36, 28, MARGIN.deltaPts, 1);

  return (
    <Stage style={{ opacity }}>
      <div style={{ ...reveal(frame, 0, 14, 8), textAlign: "center" }}>
        <MonoLabel>Protection de la marge</MonoLabel>
      </div>

      <SurfaceCard
        lift
        style={{
          ...reveal(frame, 4, 18, 14),
          width: "100%",
          maxWidth: portrait ? 820 : 900,
          padding: portrait ? 32 : 40,
        }}
      >
        <div
          style={{
            fontFamily: fontMono,
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: COLORS.muted,
            marginBottom: 8,
          }}
        >
          Impact sur votre marge
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: portrait ? "1fr" : "1.1fr 0.9fr",
            gap: portrait ? 28 : 40,
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <div>
            <Row
              style={reveal(frame, 10, 14, 8)}
              label="Avant"
              value={`Marge : ${before.toFixed(1)} %`}
              muted
            />
            <div style={{ height: 14 }} />
            <Row
              style={reveal(frame, 20, 14, 8)}
              label="Après analyse"
              value={`Marge protégée : ${after.toFixed(1)} %`}
            />

            <div
              style={{
                ...reveal(frame, 36, 18, 12),
                marginTop: 28,
                display: "inline-flex",
                alignItems: "baseline",
                gap: 10,
                padding: "12px 18px",
                borderRadius: 14,
                background: COLORS.accentSoft,
              }}
            >
              <span
                style={{
                  fontFamily: fontSans,
                  fontSize: 36,
                  fontWeight: 700,
                  letterSpacing: "-0.05em",
                  color: COLORS.accent,
                  lineHeight: 1,
                }}
              >
                +{delta.toFixed(1)} pts
              </span>
              <span style={{ fontSize: 14, color: COLORS.muted, fontWeight: 500 }}>
                de marge récupérée
              </span>
            </div>
          </div>

          <div
            style={{
              ...reveal(frame, 16, 18, 10),
              display: "flex",
              justifyContent: "center",
            }}
          >
            <MarginBars
              frame={frame}
              start={22}
              before={MARGIN.before}
              after={MARGIN.after}
              width={portrait ? 280 : 300}
            />
          </div>
        </div>
      </SurfaceCard>
    </Stage>
  );
};

function Row({
  label,
  value,
  muted,
  style,
}: {
  label: string;
  value: string;
  muted?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div style={style}>
      <div
        style={{
          fontSize: 13,
          color: COLORS.muted,
          marginBottom: 6,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "-0.035em",
          color: muted ? COLORS.muted : COLORS.text,
        }}
      >
        {value}
      </div>
    </div>
  );
}
