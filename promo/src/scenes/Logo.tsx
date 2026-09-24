import { interpolate, useCurrentFrame } from "remotion";
import { AppShell, MonoLabel } from "../chrome/AppShell";
import { HomeHero } from "../chrome/HomeHero";
import { EASE, reveal } from "../motion";
import { C, SHADOW_SOFT } from "../theme";

const DAYS = [
  { l: "L", h: 40 },
  { l: "M", h: 55 },
  { l: "M", h: 28 },
  { l: "J", h: 70 },
  { l: "V", h: 48 },
  { l: "S", h: 22 },
  { l: "D", h: 62 },
];

const ACTIONS = [
  { n: "01", label: "Projet en Focus", title: "Continuer Studio Devis", text: "Envoyer le devis test à 3 artisans." },
  { n: "02", label: "Anatomie", title: "Checklist avant lancement", text: "Les 12 frames d’une landing qui convertit." },
  { n: "03", label: "Thèmes", title: "Choisir un thème", text: "Couleurs, typos et arrondis prêts à copier." },
];

export const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AppShell tab="Accueil">
      <div style={reveal(frame, 0)}>
        <HomeHero showChips={false} />
      </div>
      <div
        style={{
          ...reveal(frame, 3),
          marginTop: 16,
          borderRadius: 18,
          border: `1px solid ${C.line}`,
          background: C.surface,
          boxShadow: SHADOW_SOFT,
          padding: "16px 20px",
        }}
      >
        <MonoLabel>/ Ma semaine ///</MonoLabel>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 72, marginTop: 12 }}>
          {DAYS.map((d, i) => {
            const g = interpolate(frame, [16 + i * 1.5, 28 + i * 1.5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: EASE,
            });
            return (
              <div key={d.l + i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: "100%",
                    height: d.h * g,
                    borderRadius: 8,
                    background: i === 6 ? C.ink : C.glow2,
                  }}
                />
                <span style={{ fontSize: 10, color: i === 6 ? C.ink : C.muted }}>{d.l}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 12 }}>
        {ACTIONS.map((a, i) => (
          <div
            key={a.n}
            style={{
              ...reveal(frame, 6 + i),
              borderRadius: 18,
              border: `1px solid ${C.line}`,
              background: C.surface,
              boxShadow: SHADOW_SOFT,
              padding: 16,
            }}
          >
            <MonoLabel>/ {a.label}</MonoLabel>
            <div style={{ marginTop: 8, fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em" }}>{a.title}</div>
            <div style={{ marginTop: 4, fontSize: 13, color: C.muted }}>{a.text}</div>
          </div>
        ))}
      </div>
    </AppShell>
  );
};
