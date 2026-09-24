import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AppShell } from "../chrome/AppShell";
import { HomeHero } from "../chrome/HomeHero";
import { reveal } from "../motion";
import { C, SHADOW_SOFT } from "../theme";

const Q = "Quelle est ma prochaine action ?";

export const Copilot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.min(
    Q.length,
    Math.floor(
      interpolate(frame, [0.35 * fps, 2.1 * fps], [0, Q.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    ),
  );

  return (
    <AppShell tab="Accueil">
      <div style={reveal(frame, 0)}>
        <HomeHero typed={Q.slice(0, n)} />
      </div>
      <div
        style={{
          ...reveal(frame, 8),
          marginTop: 16,
          borderRadius: 18,
          border: `1px solid ${C.line}`,
          background: C.surface,
          boxShadow: SHADOW_SOFT,
          padding: "16px 20px",
          fontSize: 15,
          lineHeight: 1.5,
          color: C.ink,
        }}
      >
        <span style={{ color: C.muted, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Copilote · Studio Devis
        </span>
        <p style={{ margin: "8px 0 0" }}>
          Envoie le devis test à 3 artisans cette semaine. C’est la seule action qui débloque la 1ère vente.
        </p>
      </div>
    </AppShell>
  );
};
