import { useCurrentFrame } from "remotion";
import { AppShell, MonoLabel, StatusBadge } from "../chrome/AppShell";
import { fontSans } from "../fonts";
import { reveal } from "../motion";
import { C, SHADOW_SOFT, STAGES } from "../theme";

export const Focus: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AppShell tab="Projets">
      <div style={reveal(frame, 0)}>
        <MonoLabel>/ Projets ///</MonoLabel>
        <h1
          style={{
            marginTop: 10,
            fontFamily: fontSans,
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: "-0.045em",
            lineHeight: 1.05,
          }}
        >
          Mes projets, <span style={{ color: C.accent2 }}>un seul en Focus.</span>
        </h1>
      </div>
      <div
        style={{
          ...reveal(frame, 3),
          marginTop: 22,
          borderRadius: 18,
          border: `1px solid ${C.line}`,
          background: C.surface,
          boxShadow: SHADOW_SOFT,
          padding: 24,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.03em" }}>Studio Devis</div>
            <div style={{ marginTop: 4, fontSize: 13.5, color: C.muted }}>Devis PDF pour artisans</div>
          </div>
          <StatusBadge status="focus" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, marginTop: 18 }}>
          {STAGES.map((s, i) => (
            <i
              key={s}
              style={{
                display: "block",
                height: 6,
                borderRadius: 999,
                background: i < 2 ? C.ink : i === 2 ? C.accent2 : C.line,
              }}
            />
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: C.muted }}>
          Étape 3/6 : <b style={{ color: C.ink, fontWeight: 600 }}>Bêta</b>
        </div>
        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 10,
            borderRadius: 12,
            background: C.accentSoft,
            padding: "12px 14px",
            fontSize: 14,
          }}
        >
          <b>Prochaine action :</b> Envoyer le devis test à 3 artisans.
        </div>
      </div>
    </AppShell>
  );
};
