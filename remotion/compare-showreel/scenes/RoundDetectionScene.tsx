import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { ExcelMock } from "../components/ExcelMock";
import { ShowreelAtmosphere } from "../components/ShowreelAtmosphere";
import { ProductClipSingle } from "../product-clips";
import { HaussesPanel } from "../../product-v2/embeds/HaussesPanel";
import { THEME } from "../constants";
import { fontDisplay, fontMono, fontSans } from "../fonts";

export const RoundDetectionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 18, 200, 240], [1, 1.04, 1.04, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  const labelIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      <ShowreelAtmosphere accent="neutral" />
      <AbsoluteFill style={{ padding: "80px 100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <p style={{ margin: 0, fontFamily: fontMono, fontSize: 13, color: THEME.muted, opacity: labelIn }}>
              Round 01 · Détection
            </p>
            <h2
              style={{
                margin: "10px 0 0",
                fontFamily: fontDisplay,
                fontSize: 64,
                fontWeight: 700,
                letterSpacing: "-0.04em",
              }}
            >
              Qui voit la hausse ?
            </h2>
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: fontSans,
              fontSize: 22,
              color: THEME.muted,
              opacity: interpolate(frame, [20, 36], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Même ligne PVC · +2,20 €
          </p>
        </div>

        <div
          style={{
            marginTop: 48,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 40,
            alignItems: "stretch",
          }}
        >
          <div>
            <p style={{ fontFamily: fontMono, fontSize: 12, color: THEME.excelMuted, marginBottom: 12 }}>
              Tableur & mails
            </p>
            <ExcelMock start={8} chaotic={frame > 90} />
            <p
              style={{
                marginTop: 16,
                fontFamily: fontSans,
                fontSize: 18,
                color: THEME.danger,
                fontWeight: 600,
                opacity: interpolate(frame, [100, 120], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              Découverte trop tard · aucune alerte
            </p>
          </div>
          <div>
            <p style={{ fontFamily: fontMono, fontSize: 12, color: THEME.orange, marginBottom: 12 }}>
              TARINEO
            </p>
            <ProductClipSingle nav="Hausses">
              <HaussesPanel />
            </ProductClipSingle>
            <p
              style={{
                marginTop: 16,
                fontFamily: fontSans,
                fontSize: 18,
                color: THEME.success,
                fontWeight: 600,
                opacity: interpolate(frame, [60, 80], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              Alerte instantanée · historique comparé
            </p>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
