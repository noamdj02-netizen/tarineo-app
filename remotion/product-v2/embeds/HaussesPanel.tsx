import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { DASH } from "../dashboard-tokens";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { fontSans } from "../../fonts";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

const ALERTS = [
  {
    label: "Tube PVC Ø 500 chez Cedeo",
    chantier: "Chantier Dupont",
    old: "22,40 €",
    new: "24,60 €",
    pct: "+9,8 %",
    demo: true,
  },
  {
    label: "Carrelage 60×60 · Point.P",
    chantier: "Cuisine Martin",
    old: "38,90 €",
    new: "43,60 €",
    pct: "+12,1 %",
    demo: false,
  },
] as const;

/** Miroir page `/hausses` — cartes + badge hausse. */
export function HaussesPanel() {
  const frame = useCurrentFrame();

  return (
    <div style={{ fontFamily: fontSans, height: "100%", overflow: "hidden" }}>
      <DashboardPageHeader
        title="Hausses de prix"
        description="Identifiez les augmentations qui peuvent réduire votre marge."
        showActions={false}
      />
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {ALERTS.map((a, i) => {
          const start = 8 + i * 10;
          const op = interpolate(frame, [start, start + 14], [0, 1], clamp);
          const y = interpolate(frame, [start, start + 14], [12, 0], clamp);
          return (
            <li
              key={a.label}
              style={{
                opacity: op,
                transform: `translateY(${y}px)`,
                borderRadius: DASH.radiusCard,
                border: `1px solid ${DASH.line}`,
                background: DASH.surface,
                padding: 20,
                boxShadow: DASH.shadowSoft,
              }}
            >
              {a.demo ? (
                <p style={{ margin: "0 0 6px", fontSize: 11, color: DASH.muted }}>Exemple · démo</p>
              ) : null}
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em" }}>{a.label}</p>
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: DASH.muted }}>{a.chantier}</p>
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(245,158,11,0.14)",
                    color: "#B45309",
                  }}
                >
                  {a.pct}
                </span>
              </div>
              <p
                style={{
                  margin: "16px 0 0",
                  fontSize: 20,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.02em",
                }}
              >
                {a.old}
                <span style={{ margin: "0 8px", fontSize: 14, fontWeight: 400, color: DASH.muted }}>→</span>
                {a.new}
              </p>
              <p style={{ margin: "14px 0 0", fontSize: 13 }}>
                <span style={{ color: DASH.orange, fontWeight: 600 }}>Voir la pièce</span>
                <span style={{ color: DASH.muted }}> · Comparer</span>
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
