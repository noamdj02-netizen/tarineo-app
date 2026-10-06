import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { countInt } from "../../animations";
import { ShowreelAtmosphere } from "../components/ShowreelAtmosphere";
import { THEME } from "../constants";
import { fontDisplay, fontMono, fontSans } from "../fonts";
import { TarineoLogoMark } from "../../components/TarineoLogoMark";

export const WinnerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spr = spring({ frame, fps, config: { damping: 16, stiffness: 200 } });
  const alerts = countInt(frame, 20, 40, 847);

  return (
    <AbsoluteFill>
      <ShowreelAtmosphere accent="orange" />
      <AbsoluteFill
        style={{
          padding: "100px 120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 32,
        }}
      >
        <p style={{ margin: 0, fontFamily: fontMono, fontSize: 13, color: THEME.orange }}>
          Verdict
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <TarineoLogoMark variant="mark" size={72} />
          <h2
            style={{
              margin: 0,
              fontFamily: fontDisplay,
              fontSize: 88,
              fontWeight: 700,
              letterSpacing: "-0.045em",
              transform: `scale(${interpolate(spr, [0, 1], [0.9, 1])})`,
            }}
          >
            TARINEO gagne.
          </h2>
        </div>
        <p
          style={{
            margin: 0,
            maxWidth: 820,
            fontFamily: fontSans,
            fontSize: 28,
            lineHeight: 1.45,
            color: THEME.muted,
          }}
        >
          Pas une pub de plus — un assistant qui lit vos factures, compare vos prix et protège votre
          marge sur le terrain.
        </p>
        <div style={{ display: "flex", gap: 32, marginTop: 16 }}>
          {[
            { label: "Lignes analysées", value: `${alerts}+` },
            { label: "Seuil d’alerte", value: "+3 %" },
            { label: "1er mois", value: "Offert" },
          ].map((stat) => (
            <div key={stat.label}>
              <p
                style={{
                  margin: 0,
                  fontFamily: fontDisplay,
                  fontSize: 44,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: THEME.orange,
                }}
              >
                {stat.value}
              </p>
              <p style={{ margin: "6px 0 0", fontFamily: fontMono, fontSize: 12, color: THEME.muted }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
