import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE } from "../../animations";
import { THEME } from "../constants";
import { fontDisplay, fontMono, fontSans } from "../fonts";

export const TarineoAlertCard: React.FC<{ start?: number }> = ({ start = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spr = spring({
    frame: frame - start,
    fps,
    config: { damping: 16, stiffness: 200 },
  });
  const scale = interpolate(spr, [0, 1], [0.88, 1], { easing: EASE });
  const opacity = interpolate(frame, [start, start + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bar = interpolate(frame, [start + 20, start + 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  return (
    <div
      style={{
        borderRadius: 18,
        background: "#FFFFFF",
        border: `1px solid ${THEME.line}`,
        boxShadow: `0 0 0 1px rgba(255,107,26,0.12), 0 28px 70px -32px ${THEME.orangeGlow}`,
        padding: 28,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p
            style={{
              margin: 0,
              fontFamily: fontSans,
              fontSize: 15,
              color: THEME.muted,
              fontWeight: 500,
            }}
          >
            Chantier Dupont · Cedeo
          </p>
          <p
            style={{
              margin: "8px 0 0",
              fontFamily: fontDisplay,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Tube PVC Ø 500
          </p>
        </div>
        <span
          style={{
            alignSelf: "flex-start",
            borderRadius: 999,
            padding: "6px 12px",
            background: "rgba(255,107,26,0.12)",
            color: THEME.orange,
            fontFamily: fontMono,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          +9,8 %
        </span>
      </div>
      <p
        style={{
          margin: "20px 0 0",
          fontFamily: fontDisplay,
          fontSize: 42,
          fontWeight: 700,
          letterSpacing: "-0.03em",
        }}
      >
        22,40 € → 24,60 €
      </p>
      <div
        style={{
          marginTop: 20,
          height: 8,
          borderRadius: 999,
          background: "rgba(10,10,10,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${bar * 100}%`,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${THEME.orange}, #ff8f4d)`,
          }}
        />
      </div>
      <p
        style={{
          margin: "14px 0 0",
          fontFamily: fontSans,
          fontSize: 15,
          color: THEME.muted,
        }}
      >
        Alerte dès +3 % · historique personnel
      </p>
    </div>
  );
};
