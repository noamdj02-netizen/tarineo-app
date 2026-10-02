import { BTN_PRIMARY, BTN_SECONDARY, DASH } from "../dashboard-tokens";
import { fontSans } from "../../fonts";

export function DashboardPageHeader({
  title,
  description,
  showActions = true,
}: {
  title: string;
  description?: string;
  showActions?: boolean;
}) {
  return (
    <header style={{ marginBottom: 20, fontFamily: fontSans }}>
      <nav style={{ fontSize: 12, color: DASH.muted, marginBottom: 8 }}>
        <span style={{ color: DASH.ink }}>Accueil</span>
      </nav>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: "-0.035em",
              lineHeight: 1.12,
              color: DASH.ink,
            }}
          >
            {title}
          </h1>
          {description ? (
            <p style={{ margin: "6px 0 0", fontSize: 14, color: DASH.muted, maxWidth: 480 }}>{description}</p>
          ) : null}
        </div>
        {showActions ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
            <span style={btnStyle(BTN_PRIMARY)}>+ Nouveau devis</span>
            <span style={btnStyle(BTN_SECONDARY)}>Importer</span>
            <span style={btnStyle(BTN_SECONDARY)}>Nouveau chantier</span>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function btnStyle(t: { height: number; paddingX: number; fontSize: number; fontWeight: number; borderRadius: number; background: string; color: string; border?: string }) {
  return {
    display: "inline-flex",
    alignItems: "center",
    height: t.height,
    padding: `0 ${t.paddingX}px`,
    fontSize: t.fontSize,
    fontWeight: t.fontWeight,
    borderRadius: t.borderRadius,
    background: t.background,
    color: t.color,
    border: t.border ?? "none",
    whiteSpace: "nowrap" as const,
  };
}
