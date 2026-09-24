import { useCurrentFrame } from "remotion";
import { AppShell } from "../chrome/AppShell";
import { HomeHero } from "../chrome/HomeHero";
import { fontSans } from "../fonts";
import { reveal } from "../motion";
import { C, SHADOW_SOFT } from "../theme";

const CHAOS = [
  { n: "01", title: "Studio Devis", text: "Devis PDF — toujours demain" },
  { n: "02", title: "Menu QR", text: "Cartes par QR — à moitié" },
  { n: "03", title: "Portfolio", text: "Site d’architecte — en pause" },
];

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AppShell tab="Accueil">
      <div style={reveal(frame, 0)}>
        <HomeHero showChips={false} />
      </div>
      <p
        style={{
          ...reveal(frame, 2),
          marginTop: 22,
          fontFamily: fontSans,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "-0.03em",
        }}
      >
        Dix projets ouverts. <span style={{ color: C.muted }}>Aucun ne sort.</span>
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 14 }}>
        {CHAOS.map((c, i) => (
          <div
            key={c.n}
            style={{
              ...reveal(frame, 4 + i),
              borderRadius: 18,
              border: `1px solid ${C.line}`,
              background: C.surface,
              boxShadow: SHADOW_SOFT,
              padding: 20,
            }}
          >
            <div style={{ fontFamily: fontSans, fontSize: 11, color: C.muted }}>{c.n} /</div>
            <div style={{ marginTop: 8, fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>{c.title}</div>
            <div style={{ marginTop: 6, fontSize: 14, color: C.muted }}>{c.text}</div>
          </div>
        ))}
      </div>
    </AppShell>
  );
};
