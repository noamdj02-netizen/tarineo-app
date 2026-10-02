import type { CSSProperties } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { countFloat, countInt, reveal, sceneOpacity } from "../animations";
import { COLORS, SCENE } from "../constants";
import { ANALYSIS } from "../data";
import { fontMono, fontSans } from "../fonts";
import { Sparkline } from "../components/Charts";
import { HorizontalScan } from "../components/ScanLine";
import { MonoLabel, Stage, SurfaceCard } from "../components/Stage";

const DURATION = SCENE.analysis.duration;

export const AnalysisScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const opacity = sceneOpacity(frame, DURATION, 14);

  const lines = countInt(frame, 8, 36, ANALYSIS.lines);
  const evo = countFloat(frame, 18, 40, ANALYSIS.evolution, 1);
  const ups = countInt(frame, 28, 28, ANALYSIS.increases);
  const anomalies = countInt(frame, 34, 24, ANALYSIS.anomalies);

  const highlightProgress = interpolate(frame, [20, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const done = frame >= 78;
  const badge = reveal(frame, 78, 16, 10);

  return (
    <Stage style={{ opacity }}>
      <div style={{ ...reveal(frame, 0, 14, 8), textAlign: "center" }}>
        <MonoLabel>Analyse Tarinéo</MonoLabel>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: portrait ? 860 : 980,
          display: "grid",
          gridTemplateColumns: portrait ? "1fr" : "1.15fr 0.85fr",
          gap: 20,
        }}
      >
        <SurfaceCard
          lift
          style={{
            ...reveal(frame, 4, 18, 14),
            position: "relative",
            minHeight: portrait ? 320 : 360,
          }}
        >
          <div style={{ padding: 28 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 22,
              }}
            >
              <span
                style={{
                  fontFamily: fontMono,
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: done ? COLORS.success : COLORS.accent,
                }}
              >
                {done ? "Analyse terminée" : "Analyse en cours"}
              </span>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  background: done ? COLORS.success : COLORS.accent,
                  boxShadow: done
                    ? "0 0 0 4px rgba(26,127,75,0.12)"
                    : "0 0 0 4px rgba(236,88,33,0.12)",
                }}
              />
            </div>

            {[0, 1, 2, 3, 4].map((i) => {
              const active = highlightProgress > i * 0.18;
              return (
                <div
                  key={i}
                  style={{
                    height: 36,
                    marginBottom: 10,
                    borderRadius: 10,
                    border: `1px solid ${COLORS.border}`,
                    background: active ? COLORS.accentSoft : COLORS.bg,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 14px",
                    gap: 12,
                    opacity: interpolate(frame, [6 + i * 4, 18 + i * 4], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                  }}
                >
                  <div
                    style={{
                      width: 88 + i * 28,
                      height: 8,
                      borderRadius: 4,
                      background: active ? "rgba(236,88,33,0.35)" : "rgba(17,17,17,0.1)",
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      background: "rgba(17,17,17,0.06)",
                    }}
                  />
                  <div
                    style={{
                      width: 48,
                      height: 8,
                      borderRadius: 4,
                      background: active ? COLORS.accent : "rgba(17,17,17,0.12)",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <HorizontalScan frame={frame} start={12} duration={55} width={portrait ? 760 : 520} />
        </SurfaceCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SurfaceCard style={{ ...reveal(frame, 10, 16, 12), padding: 22 }}>
            <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>Lignes analysées</div>
            <div
              style={{
                fontFamily: fontSans,
                fontSize: 42,
                fontWeight: 700,
                letterSpacing: "-0.05em",
                lineHeight: 1,
              }}
            >
              {lines}
            </div>
          </SurfaceCard>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <Stat
              style={reveal(frame, 18, 16, 10)}
              label="Évolution moy."
              value={`+${evo.toFixed(1)} %`}
              accent
            />
            <Stat style={reveal(frame, 24, 16, 10)} label="Hausses" value={String(ups)} />
            <Stat style={reveal(frame, 30, 16, 10)} label="Anomalie" value={String(anomalies)} accent />
            <div
              style={{
                ...reveal(frame, 36, 16, 10),
                borderRadius: 16,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.surface,
                padding: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkline frame={frame} start={40} width={140} height={48} accent />
            </div>
          </div>

          <div
            style={{
              ...badge,
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 999,
              background: COLORS.successSoft,
              color: COLORS.success,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 99,
                background: COLORS.success,
              }}
            />
            Analyse terminée
          </div>
        </div>
      </div>
    </Stage>
  );
};

function Stat({
  label,
  value,
  accent,
  style,
}: {
  label: string;
  value: string;
  accent?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        ...style,
        borderRadius: 16,
        border: `1px solid ${COLORS.border}`,
        background: COLORS.surface,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>{label}</div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: accent ? COLORS.accent : COLORS.text,
        }}
      >
        {value}
      </div>
    </div>
  );
}
