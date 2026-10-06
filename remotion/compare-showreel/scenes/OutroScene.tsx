import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { ShowreelAtmosphere } from "../components/ShowreelAtmosphere";
import { THEME } from "../constants";
import { fontDisplay, fontSans } from "../fonts";
import { TarineoLogoMark } from "../../components/TarineoLogoMark";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const inOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  return (
    <AbsoluteFill>
      <ShowreelAtmosphere />
      <AbsoluteFill
        style={{
          background: THEME.ink,
          opacity: interpolate(frame, [0, 30], [0, 0.92], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          opacity: inOpacity,
        }}
      >
        <TarineoLogoMark variant="light" size={64} />
        <p
          style={{
            margin: 0,
            fontFamily: fontDisplay,
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            color: "#fff",
            textAlign: "center",
          }}
        >
          Protégez votre marge.
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: fontSans,
            fontSize: 24,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          tarineo.fr · 1er mois offert
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
