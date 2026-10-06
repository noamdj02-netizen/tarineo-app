import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE } from "../../animations";
import { ExcelMock } from "../components/ExcelMock";
import { ShowreelAtmosphere } from "../components/ShowreelAtmosphere";
import { ProductClipSingle } from "../product-clips";
import { HaussesPanel } from "../../product-v2/embeds/HaussesPanel";
import { THEME } from "../constants";
import { fontDisplay, fontMono } from "../fonts";
import { TarineoLogoMark } from "../../components/TarineoLogoMark";

export const VsIntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const split = spring({ frame: frame - 8, fps, config: { damping: 20, stiffness: 180 } });
  const gap = interpolate(split, [0, 1], [0, 48], { easing: EASE });

  const vsScale = spring({ frame: frame - 22, fps, config: { damping: 14, stiffness: 260 } });

  return (
    <AbsoluteFill>
      <ShowreelAtmosphere />
      <AbsoluteFill
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: gap,
          padding: "88px 100px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <p
            style={{
              margin: 0,
              fontFamily: fontMono,
              fontSize: 13,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: THEME.excelGreen,
            }}
          >
            Canal A
          </p>
          <p
            style={{
              margin: 0,
              fontFamily: fontDisplay,
              fontSize: 52,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
            }}
          >
            Tableur
            <br />
            & mails
          </p>
          <ExcelMock start={12} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <p
            style={{
              margin: 0,
              fontFamily: fontMono,
              fontSize: 13,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: THEME.orange,
            }}
          >
            Canal B
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <TarineoLogoMark variant="mark" size={48} />
            <p
              style={{
                margin: 0,
                fontFamily: fontDisplay,
                fontSize: 52,
                fontWeight: 700,
                letterSpacing: "-0.04em",
              }}
            >
              TARINEO
            </p>
          </div>
          <div style={{ transform: "scale(0.92)", transformOrigin: "top left" }}>
            <ProductClipSingle nav="Hausses">
              <HaussesPanel />
            </ProductClipSingle>
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 999,
            background: THEME.ink,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontFamily: fontDisplay,
            fontSize: 36,
            fontWeight: 700,
            transform: `scale(${interpolate(vsScale, [0, 1], [0.4, 1])})`,
            boxShadow: `0 0 0 6px ${THEME.canvas}, 0 20px 50px rgba(10,10,10,0.25)`,
          }}
        >
          VS
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
