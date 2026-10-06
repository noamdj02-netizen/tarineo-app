import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { ShowreelAtmosphere } from "../components/ShowreelAtmosphere";
import { KineticTitle } from "../components/KineticTitle";
import { THEME } from "../constants";
import { fontMono, fontSans } from "../fonts";

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [0, 6, 14], [1, 0.15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <ShowreelAtmosphere />
      <AbsoluteFill
        style={{
          backgroundColor: THEME.ink,
          opacity: flash,
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "100px 120px",
          gap: 28,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: fontMono,
            fontSize: 14,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: THEME.orange,
            opacity: interpolate(frame, [8, 22], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Motion · BTP · Marge
        </p>
        <KineticTitle
          start={12}
          lines={[
            { text: "Deux façons de", size: "lg" },
            { text: "surveiller vos achats.", size: "xl", accent: true },
          ]}
        />
        <p
          style={{
            margin: 0,
            maxWidth: 720,
            fontFamily: fontSans,
            fontSize: 28,
            lineHeight: 1.45,
            color: THEME.muted,
            opacity: interpolate(frame, [36, 52], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: EASE,
            }),
            transform: `translateY(${interpolate(frame, [36, 52], [20, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: EASE,
            })}px)`,
          }}
        >
          Tableur & mails vs TARINEO — même chantier, deux réalités.
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
