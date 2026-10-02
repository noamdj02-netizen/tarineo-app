import type { CSSProperties } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { TarineoLogoMark } from "../../components/TarineoLogoMark";
import { fontSans } from "../../fonts";
import { COLORS, SHADOW, SHADOW_LIFT } from "../constants";
import {
  DEMO_ACTIONS,
  DEMO_CHANTIERS,
  DEMO_KPIS,
  NAV_ITEMS,
} from "../data";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

type Layer =
  | "all"
  | "canvas"
  | "sidebar"
  | "topbar"
  | "kpi"
  | "cards"
  | "activity"
  | "chart";

export function DashboardMockup({
  frameOffset = 0,
  highlight,
  layerProgress = 1,
  zoom = 1,
  style,
}: {
  frameOffset?: number;
  /** Index KPI / zone à souligner (0–4) ou null */
  highlight?: number | null;
  /** 0→1 pour stagger d’apparition des couches */
  layerProgress?: number;
  zoom?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame() + frameOffset;

  const show = (threshold: number) =>
    interpolate(layerProgress, [threshold, Math.min(1, threshold + 0.12)], [0, 1], clamp);

  const canvasOp = show(0);
  const sideOp = show(0.12);
  const topOp = show(0.24);
  const kpiOp = show(0.36);
  const cardsOp = show(0.5);
  const actOp = show(0.64);
  const chartOp = show(0.78);

  return (
    <div
      style={{
        width: 1280,
        height: 760,
        borderRadius: 22,
        overflow: "hidden",
        background: COLORS.canvas,
        boxShadow: SHADOW_LIFT,
        transform: `scale(${zoom})`,
        transformOrigin: "center center",
        fontFamily: fontSans,
        color: COLORS.ink,
        opacity: canvasOp,
        ...style,
      }}
    >
      <div style={{ display: "flex", height: "100%" }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 220,
            background: COLORS.dark,
            color: COLORS.white,
            padding: "18px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            opacity: sideOp,
            transform: `translateX(${interpolate(sideOp, [0, 1], [-16, 0])}px)`,
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ padding: "4px 8px", display: "flex", alignItems: "center", gap: 8 }}>
            <TarineoLogoMark size={22} variant="dark" />
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV_ITEMS.map((label, i) => {
              const active = i === 0;
              const itemOp = interpolate(
                layerProgress,
                [0.14 + i * 0.03, 0.22 + i * 0.03],
                [0, 1],
                clamp,
              );
              return (
                <div
                  key={label}
                  style={{
                    opacity: itemOp * sideOp,
                    height: 34,
                    borderRadius: 10,
                    padding: "0 10px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    background: active ? "rgba(255,107,26,0.16)" : "transparent",
                    color: active ? COLORS.accent : "rgba(255,255,255,0.72)",
                  }}
                >
                  {label}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <header
            style={{
              height: 64,
              borderBottom: `1px solid ${COLORS.border}`,
              background: COLORS.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 28px",
              opacity: topOp,
              transform: `translateY(${interpolate(topOp, [0, 1], [-10, 0])}px)`,
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>Accueil</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 650, letterSpacing: "-0.02em" }}>
                Bonjour, Noam
              </p>
            </div>
            <div
              style={{
                height: 36,
                padding: "0 14px",
                borderRadius: 10,
                background: COLORS.accent,
                color: COLORS.white,
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
              }}
            >
              Nouveau devis
            </div>
          </header>

          <div style={{ flex: 1, padding: 22, overflow: "hidden", background: COLORS.canvas }}>
            {/* KPIs */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 10,
                marginBottom: 16,
                opacity: kpiOp,
              }}
            >
              {DEMO_KPIS.map((k, i) => {
                const lit = highlight === i;
                const ring = lit
                  ? interpolate(frame % 30, [0, 12, 30], [0.55, 1, 0.35], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    })
                  : 0;
                return (
                  <div
                    key={k.label}
                    style={{
                      background: COLORS.white,
                      border: `1px solid ${COLORS.border}`,
                      boxShadow: SHADOW,
                      borderRadius: 14,
                      padding: "12px 12px 14px",
                      outline: lit ? `1.5px solid rgba(255,107,26,${ring})` : "none",
                      outlineOffset: 1,
                      transform: `translateY(${interpolate(kpiOp, [0, 1], [12, 0])}px) scale(${lit ? 1.02 : 1})`,
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 11, color: COLORS.muted }}>{k.label}</p>
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: 24,
                        fontWeight: 700,
                        letterSpacing: "-0.03em",
                        color: k.accent ? COLORS.accent : COLORS.ink,
                      }}
                    >
                      {k.value}
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: COLORS.muted }}>{k.hint}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 14 }}>
              {/* Actions + chantiers */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: cardsOp }}>
                <Panel title="À traiter">
                  {DEMO_ACTIONS.map((a) => (
                    <div
                      key={a.title}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 8px",
                        borderRadius: 8,
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{a.title}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: COLORS.muted }}>{a.hint}</p>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent }}>{a.cta} →</span>
                    </div>
                  ))}
                </Panel>
                <Panel title="Chantiers actifs">
                  {DEMO_CHANTIERS.map((c) => (
                    <div
                      key={c.name}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 8px",
                        borderLeft: `2px solid ${c.tone}`,
                        marginBottom: 4,
                        background: COLORS.white,
                        borderRadius: "0 10px 10px 0",
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{c.name}</p>
                      <span style={{ fontSize: 11, color: COLORS.muted }}>{c.status}</span>
                    </div>
                  ))}
                </Panel>
              </div>

              {/* Activity + mini chart */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Panel title="Activité" style={{ opacity: actOp }}>
                  {["Devis envoyé · Dupont", "Facture créée · #1048", "Import CEDEO", "Relance envoyée"].map(
                    (row) => (
                      <p
                        key={row}
                        style={{
                          margin: "0 0 8px",
                          fontSize: 12.5,
                          color: COLORS.muted,
                          paddingLeft: 10,
                          borderLeft: `2px solid ${COLORS.accentWash}`,
                        }}
                      >
                        {row}
                      </p>
                    ),
                  )}
                </Panel>
                <Panel title="Indice achats" style={{ opacity: chartOp }}>
                  <MiniChart progress={chartOp} />
                </Panel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
  style,
}: {
  title: string;
  children: React.ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: "14px 14px 12px",
        boxShadow: SHADOW,
        ...style,
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 13,
          fontWeight: 650,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function MiniChart({ progress }: { progress: number }) {
  const path =
    "M8 70 C 40 66, 70 58, 100 52 S 160 40, 200 28 S 260 22, 300 14";
  const len = 360;
  const dash = interpolate(progress, [0, 1], [len, 0], clamp);

  return (
    <svg width="100%" height="84" viewBox="0 0 320 84" fill="none">
      <defs>
        <linearGradient id="tarineoArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF6B1A" stopOpacity="0.28" />
          <stop offset="1" stopColor="#FF6B1A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${path} L 300 84 L 8 84 Z`}
        fill="url(#tarineoArea)"
        opacity={progress}
      />
      <path
        d={path}
        stroke={COLORS.accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={dash}
      />
    </svg>
  );
}

export type { Layer };
