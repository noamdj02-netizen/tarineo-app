import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { countInt, EASE } from "../../animations";
import { ShowreelAtmosphere } from "../components/ShowreelAtmosphere";
import { THEME } from "../constants";
import { fontDisplay, fontMono, fontSans } from "../fonts";

export const RoundTimeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const manualHours = countInt(frame, 24, 50, 4);
  const tarineoMin = countInt(frame, 30, 45, 12);

  const punch = spring({ frame: frame - 70, fps, config: { damping: 12, stiffness: 280 } });

  return (
    <AbsoluteFill>
      <ShowreelAtmosphere accent="orange" />
      <AbsoluteFill
        style={{
          padding: "100px 120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 56,
        }}
      >
        <p style={{ margin: 0, fontFamily: fontMono, fontSize: 13, color: THEME.muted }}>
          Round 02 · Temps terrain
        </p>
        <h2
          style={{
            margin: 0,
            fontFamily: fontDisplay,
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            maxWidth: 900,
          }}
        >
          Combien de temps par semaine ?
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          <div
            style={{
              padding: 36,
              borderRadius: 20,
              background: "rgba(10,10,10,0.04)",
              border: `1px solid ${THEME.line}`,
            }}
          >
            <p style={{ margin: 0, fontFamily: fontMono, fontSize: 12, color: THEME.excelMuted }}>
              Tableur & mails
            </p>
            <p
              style={{
                margin: "16px 0 0",
                fontFamily: fontDisplay,
                fontSize: 96,
                fontWeight: 700,
                letterSpacing: "-0.05em",
                color: THEME.muted,
              }}
            >
              {manualHours}h
            </p>
            <p style={{ margin: "8px 0 0", fontFamily: fontSans, fontSize: 20, color: THEME.muted }}>
              Saisie, relances, oublis
            </p>
          </div>
          <div
            style={{
              padding: 36,
              borderRadius: 20,
              background: "#fff",
              border: `1px solid rgba(255,107,26,0.25)`,
              boxShadow: `0 24px 80px -40px ${THEME.orangeGlow}`,
              transform: `scale(${interpolate(punch, [0, 1], [0.96, 1], { easing: EASE })})`,
            }}
          >
            <p style={{ margin: 0, fontFamily: fontMono, fontSize: 12, color: THEME.orange }}>
              TARINEO
            </p>
            <p
              style={{
                margin: "16px 0 0",
                fontFamily: fontDisplay,
                fontSize: 96,
                fontWeight: 700,
                letterSpacing: "-0.05em",
                color: THEME.orange,
              }}
            >
              {tarineoMin} min
            </p>
            <p style={{ margin: "8px 0 0", fontFamily: fontSans, fontSize: 20, color: THEME.ink }}>
              Import PDF · alertes auto
            </p>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
