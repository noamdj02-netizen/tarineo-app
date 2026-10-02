import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { reveal, sceneOpacity } from "../animations";
import { COLORS, SCENE } from "../constants";
import { INVOICE } from "../data";
import { fontMono, fontSans } from "../fonts";
import { VerticalScan } from "../components/ScanLine";
import { MonoLabel, Stage, SurfaceCard } from "../components/Stage";

const DURATION = SCENE.document.duration;

export const DocumentScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const opacity = sceneOpacity(frame, DURATION, 14);

  const floatY = interpolate(frame, [0, DURATION], [18, -6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tilt = interpolate(frame, [0, 40, DURATION], [4.5, 2.2, 1.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardEnter = reveal(frame, 4, 22, 28);

  return (
    <Stage style={{ opacity }}>
      <div style={{ ...reveal(frame, 0, 16, 10), textAlign: "center" }}>
        <MonoLabel>Document fournisseur</MonoLabel>
      </div>

      <div
        style={{
          ...cardEnter,
          width: "100%",
          maxWidth: portrait ? 760 : 640,
          transform: `${cardEnter.transform} translateY(${floatY}px) perspective(1200px) rotateX(${tilt}deg)`,
          transformOrigin: "center top",
        }}
      >
        <SurfaceCard lift style={{ position: "relative" }}>
          <div style={{ padding: portrait ? "28px 32px" : "32px 40px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: fontSans,
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {INVOICE.supplier}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: fontMono,
                    fontSize: 11,
                    color: COLORS.muted,
                    letterSpacing: "0.04em",
                  }}
                >
                  {INVOICE.ref} · {INVOICE.date}
                </div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: COLORS.muted,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.bg,
                }}
              >
                Facture
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {INVOICE.lines.map((line, i) => {
                const lineStyle = reveal(frame, 18 + i * 6, 14, 8);
                return (
                  <div
                    key={line.label}
                    style={{
                      ...lineStyle,
                      display: "grid",
                      gridTemplateColumns: "1fr auto auto",
                      gap: 16,
                      alignItems: "baseline",
                      padding: "12px 0",
                      borderTop: `1px solid ${COLORS.border}`,
                      opacity: line.muted ? lineStyle.opacity * 0.45 : lineStyle.opacity,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        letterSpacing: "-0.02em",
                        color: line.muted ? COLORS.muted : COLORS.text,
                      }}
                    >
                      {line.label}
                    </span>
                    <span style={{ fontSize: 13, color: COLORS.muted, fontFamily: fontMono }}>
                      {line.qty}
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        letterSpacing: "-0.02em",
                        textAlign: "right",
                        minWidth: 72,
                      }}
                    >
                      {line.price}
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                ...reveal(frame, 48, 16, 8),
                marginTop: 8,
                paddingTop: 18,
                borderTop: `1.5px solid ${COLORS.text}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  fontFamily: fontMono,
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: COLORS.muted,
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.045em",
                }}
              >
                {INVOICE.total}
              </span>
            </div>
          </div>

          <VerticalScan frame={frame} start={28} duration={52} height={portrait ? 420 : 380} />
        </SurfaceCard>
      </div>
    </Stage>
  );
};
