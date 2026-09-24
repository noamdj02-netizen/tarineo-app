import { useCurrentFrame } from "remotion";
import { fontGrotesk, fontSans } from "../fonts";
import { reveal } from "../motion";
import { C, SHADOW_DARK } from "../theme";

export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: C.ink,
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 100,
      }}
    >
      <div style={reveal(frame, 0)}>
        <div
          style={{
            fontFamily: fontGrotesk,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            marginBottom: 24,
          }}
        >
          Navpit<span style={{ color: C.accent2 }}>.</span>
        </div>
        <div
          style={{
            fontFamily: fontSans,
            fontSize: 64,
            fontWeight: 600,
            letterSpacing: "-0.045em",
            lineHeight: 1.04,
            maxWidth: 1200,
          }}
        >
          Prêt à lancer ton prochain projet ?
        </div>
        <div
          style={{
            marginTop: 32,
            display: "inline-flex",
            alignItems: "center",
            background: "#fff",
            color: C.ink,
            borderRadius: 999,
            padding: "16px 28px",
            fontFamily: fontSans,
            fontSize: 18,
            fontWeight: 600,
            width: "fit-content",
            boxShadow: SHADOW_DARK,
          }}
        >
          Commencer gratuitement
        </div>
      </div>
    </div>
  );
};
