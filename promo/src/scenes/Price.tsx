import { useCurrentFrame } from "remotion";
import { AppShell, MonoLabel } from "../chrome/AppShell";
import { fontSans } from "../fonts";
import { reveal } from "../motion";
import { C, SHADOW_SOFT } from "../theme";

const TIERS = [
  { y: "1re année", p: "15 €", on: true },
  { y: "2e année", p: "12 €", on: false },
  { y: "Dès la 3e année", p: "9 €", on: false },
];

export const Price: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AppShell tab="Accueil">
      <div style={reveal(frame, 0)}>
        <MonoLabel>/ Abonnement ///</MonoLabel>
        <h1
          style={{
            marginTop: 8,
            fontFamily: fontSans,
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: "-0.045em",
          }}
        >
          Plan Gratuit, <span style={{ color: C.accent2 }}>tes limites et ton prix.</span>
        </h1>
      </div>

      <div
        style={{
          ...reveal(frame, 2),
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
        }}
      >
        {[
          { l: "Projets", u: "1", m: "2" },
          { l: "Questions IA ce mois", u: "4", m: "30" },
          { l: "Schémas", u: "0", m: "3" },
        ].map((x) => (
          <div
            key={x.l}
            style={{
              borderRadius: 18,
              border: `1px solid ${C.line}`,
              background: C.surface,
              boxShadow: SHADOW_SOFT,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 13, color: C.muted }}>{x.l}</div>
            <div style={{ marginTop: 6, fontSize: 24, fontWeight: 600, letterSpacing: "-0.04em" }}>
              {x.u}
              <span style={{ fontSize: 14, fontWeight: 400, color: C.muted }}> / {x.m}</span>
            </div>
            <div style={{ marginTop: 10, height: 6, borderRadius: 999, background: C.line }}>
              <div
                style={{
                  width: `${(Number(x.u) / Number(x.m)) * 100}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: C.ink,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
        {TIERS.map((t, i) => (
          <div
            key={t.y}
            style={{
              ...reveal(frame, 5 + i),
              borderRadius: 14,
              border: `1px solid ${t.on ? C.ink : C.line}`,
              background: t.on ? C.ink : C.surface,
              color: t.on ? "#fff" : C.ink,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.04em" }}>{t.p}</div>
            <div style={{ marginTop: 4, fontSize: 12, color: t.on ? "rgba(255,255,255,0.7)" : C.muted }}>{t.y}</div>
          </div>
        ))}
      </div>
    </AppShell>
  );
};
