import type { CSSProperties } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { fontSans } from "../../fonts";
import { DASH } from "../dashboard-tokens";
import { DashboardPageHeader } from "./DashboardPageHeader";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

const KPIS = [
  { label: "Devis à envoyer", value: "3", hint: "prêts côté client", accent: "#FF6B1A" },
  { label: "Hausses", value: "2", hint: "prix fournisseur", accent: "#F59E0B" },
  { label: "Factures client", value: "5", hint: "pièces émises", accent: "#16A34A" },
  { label: "Relances", value: "1", hint: "à traiter", accent: "#9A9A9A" },
  { label: "Achats du mois", value: "18 400 €", hint: "HT lignes", accent: "#9A9A9A" },
] as const;

const ACTIONS = [
  { title: "Envoyer devis SDB Dupont", hint: "Client · 4 280 € HT", cta: "Ouvrir", dot: "#FF6B1A" },
  { title: "Hausse carrelage · Point.P", hint: "+12 % vs dernier achat", cta: "Voir", dot: "#F59E0B" },
  { title: "Relancer facture #1042", hint: "Échéance dépassée", cta: "Relancer", dot: "#9A9A9A" },
] as const;

const CHANTIERS = [
  { name: "SDB · Dupont", status: "En cours", tone: "#16A34A" },
  { name: "Cuisine · Martin", status: "Pause", tone: "#F59E0B" },
  { name: "Rénovation · Leroy", status: "En cours", tone: "#16A34A" },
] as const;

/** Miroir `HomeDashboardClient` — KPI, À traiter, chantiers. */
export function AccueilContent({
  progress = 1,
  style,
}: {
  progress?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const kpiOp = interpolate(progress, [0.08, 0.32], [0, 1], clamp);
  const actionsOp = interpolate(progress, [0.28, 0.52], [0, 1], clamp);
  const chantiersOp = interpolate(progress, [0.42, 0.65], [0, 1], clamp);
  const actOp = interpolate(progress, [0.52, 0.78], [0, 1], clamp);

  return (
    <div style={{ fontFamily: fontSans, ...style }}>
      <DashboardPageHeader title="Bonjour, Noam" description="Voici ce qui mérite votre attention." />

      <ul
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 12,
          margin: "0 0 20px",
          padding: 0,
          listStyle: "none",
          opacity: kpiOp,
          transform: `translateY(${interpolate(kpiOp, [0, 1], [8, 0])}px)`,
        }}
      >
        {KPIS.map((k) => (
          <li key={k.label}>
            <div
              style={{
                background: DASH.surface,
                border: `1px solid ${DASH.line}`,
                borderRadius: DASH.radiusCard,
                padding: "14px 16px",
                boxShadow: DASH.shadowSoft,
              }}
            >
              <p
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: DASH.muted,
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: 99, background: k.accent }} />
                {k.label}
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 24,
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  fontVariantNumeric: "tabular-nums",
                  color: k.label === "Hausses" ? DASH.orange : DASH.ink,
                }}
              >
                {k.value}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: DASH.muted }}>{k.hint}</p>
            </div>
          </li>
        ))}
      </ul>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 12 }}>
        <Panel title="À traiter" link="Voir tout" opacity={actionsOp}>
          {ACTIONS.map((a) => (
            <div
              key={a.title}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: 12,
                minHeight: 52,
                padding: "8px 10px",
                borderRadius: 8,
              }}
            >
              <div>
                <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 99, background: a.dot }} />
                  {a.title}
                </p>
                <p style={{ margin: "2px 0 0", paddingLeft: 13, fontSize: 12, color: DASH.muted }}>{a.hint}</p>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: DASH.orange }}>{a.cta} →</span>
            </div>
          ))}
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Panel title="Chantiers actifs" link="Tous" opacity={chantiersOp}>
            {CHANTIERS.map((c) => (
              <div
                key={c.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 10px",
                  borderLeft: `2px solid ${c.tone}`,
                  marginBottom: 4,
                  borderRadius: "0 10px 10px 0",
                  background: DASH.surface2,
                }}
              >
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{c.name}</p>
                <span style={{ fontSize: 12, color: DASH.muted }}>{c.status}</span>
              </div>
            ))}
          </Panel>
          <Panel title="Activité" opacity={actOp}>
            {["Devis envoyé · Dupont", "Hausse détectée · Point.P", "Import CEDEO", "Relance programmée"].map(
              (row, i) => (
                <p
                  key={row}
                  style={{
                    margin: "0 0 8px",
                    fontSize: 12.5,
                    color: DASH.muted,
                    paddingLeft: 10,
                    borderLeft: `2px solid ${DASH.orange}`,
                    opacity: interpolate(frame, [24 + i * 3, 32 + i * 3], [0.45, 1], clamp),
                  }}
                >
                  {row}
                </p>
              ),
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  link,
  children,
  opacity = 1,
}: {
  title: string;
  link?: string;
  children: React.ReactNode;
  opacity?: number;
}) {
  return (
    <div
      style={{
        background: DASH.surface,
        border: `1px solid ${DASH.line}`,
        borderRadius: 16,
        padding: "16px 18px",
        boxShadow: DASH.shadowSoft,
        opacity,
        transform: `translateY(${interpolate(opacity, [0, 1], [10, 0])}px)`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "baseline" }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{title}</p>
        {link ? <span style={{ fontSize: 12, color: DASH.muted }}>{link}</span> : null}
      </div>
      {children}
    </div>
  );
}
