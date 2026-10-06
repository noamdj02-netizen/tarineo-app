import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { MarginBars } from "../../components/Charts";
import { ShowreelAtmosphere } from "../components/ShowreelAtmosphere";
import { THEME } from "../constants";
import { fontDisplay, fontMono, fontSans } from "../fonts";

export const RoundMarginScene: React.FC = () => {
  const frame = useCurrentFrame();
  const slide = interpolate(frame, [0, 24], [80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  return (
    <AbsoluteFill>
      <ShowreelAtmosphere />
      <AbsoluteFill
        style={{
          padding: "88px 100px",
          transform: `translateX(${slide}px)`,
        }}
      >
        <p style={{ margin: 0, fontFamily: fontMono, fontSize: 13, color: THEME.muted }}>
          Round 03 · Marge
        </p>
        <h2
          style={{
            margin: "12px 0 40px",
            fontFamily: fontDisplay,
            fontSize: 68,
            fontWeight: 700,
            letterSpacing: "-0.04em",
          }}
        >
          Impact sur 12 mois d’achats
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          <div>
            <p style={{ fontFamily: fontMono, fontSize: 12, color: THEME.excelMuted }}>Sans alerte</p>
            <MarginBars frame={frame} start={20} before={18.2} after={14.6} width={380} />
            <p
              style={{
                marginTop: 20,
                fontFamily: fontSans,
                fontSize: 22,
                color: THEME.danger,
                fontWeight: 600,
              }}
            >
              −3,6 pts de marge · hausses diluées
            </p>
          </div>
          <div>
            <p style={{ fontFamily: fontMono, fontSize: 12, color: THEME.orange }}>Avec TARINEO</p>
            <MarginBars frame={frame} start={28} before={18.2} after={17.4} width={380} />
            <p
              style={{
                marginTop: 20,
                fontFamily: fontSans,
                fontSize: 22,
                color: THEME.success,
                fontWeight: 600,
              }}
            >
              Marge protégée · négociation ciblée
            </p>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
