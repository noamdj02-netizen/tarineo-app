import { useCurrentFrame } from "remotion";
import { AppShell, MonoLabel, StatusBadge } from "../chrome/AppShell";
import { fontSans } from "../fonts";
import { reveal } from "../motion";
import { C, SHADOW_SOFT, STAGES } from "../theme";

const PROJECTS = [
  {
    name: "Studio Devis",
    text: "Devis PDF pour artisans",
    status: "focus" as const,
    stage: 3,
    next: "Envoyer le devis test à 3 artisans.",
    feat: "4/8 fonctions",
    tasks: "6/12 tâches",
  },
  {
    name: "Menu QR",
    text: "Cartes par QR code",
    status: "pause" as const,
    stage: 2,
    next: "Reprendre après la 1ère vente.",
    feat: "2/6 fonctions",
    tasks: "1/8 tâches",
  },
  {
    name: "Portfolio",
    text: "Site d’architecte",
    status: "fini" as const,
    stage: 6,
    next: "Archivé.",
    feat: "9/9 fonctions",
    tasks: "14/14 tâches",
  },
];

export const Projects: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AppShell tab="Projets">
      <div style={reveal(frame, 0)}>
        <MonoLabel>/ Projets ///</MonoLabel>
        <h1
          style={{
            marginTop: 8,
            fontFamily: fontSans,
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: "-0.045em",
          }}
        >
          Étape, prochaine action, liens.
        </h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 18 }}>
        {PROJECTS.map((p, i) => (
          <article
            key={p.name}
            style={{
              ...reveal(frame, 2 + i),
              borderRadius: 18,
              border: `1px solid ${C.line}`,
              background: C.surface,
              boxShadow: SHADOW_SOFT,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.03em" }}>{p.name}</div>
                <div style={{ marginTop: 4, fontSize: 13, color: C.muted }}>{p.text}</div>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
                {STAGES.map((s, n) => (
                  <i
                    key={s}
                    style={{
                      display: "block",
                      height: 6,
                      borderRadius: 999,
                      background: n + 1 < p.stage ? C.ink : n + 1 === p.stage ? C.accent2 : C.line,
                    }}
                  />
                ))}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: C.muted }}>
                Étape {p.stage}/6 : <b style={{ color: C.ink }}>{STAGES[p.stage - 1]}</b>
              </div>
            </div>
            <div
              style={{
                borderRadius: 12,
                background: C.accentSoft,
                padding: "10px 12px",
                fontSize: 13,
                lineHeight: 1.35,
              }}
            >
              <b>Prochaine action :</b> {p.next}
            </div>
            <div style={{ fontFamily: "inherit", fontSize: 11, color: C.muted }}>
              {p.feat} · {p.tasks}
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
};
