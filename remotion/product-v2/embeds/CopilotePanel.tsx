import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { C, SHADOW } from "../constants";
import { COPILOTE_ACTIONS, COPY } from "../data";
import { HdMascot, SoftCard } from "../ui";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

/** Intérieur `CopiloteScene` (dashboard flou + panneau assistant). */
export function CopilotePanel() {
  const frame = useCurrentFrame();
  const selected = 0;
  const selectOn = interpolate(frame, [38, 52], [0, 1], clamp);
  const panelIn = interpolate(frame, [6, 22], [0, 1], clamp);

  return (
    <div style={{ position: "relative", height: "100%", minHeight: 520 }}>
      <div style={{ opacity: 0.55, filter: "blur(0.5px)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginBottom: 14,
          }}
        >
          {["Devis à envoyer", "Hausses", "Factures", "Relances"].map((l) => (
            <div
              key={l}
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: 12,
                height: 72,
              }}
            >
              <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{l}</p>
              <p style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 700 }}>—</p>
            </div>
          ))}
        </div>
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            height: 220,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          right: 28,
          top: 72,
          width: 392,
          opacity: panelIn,
          transform: `translateY(${interpolate(panelIn, [0, 1], [24, 0])}px) scale(${interpolate(panelIn, [0, 1], [0.96, 1])})`,
        }}
      >
        <SoftCard
          style={{
            overflow: "hidden",
            borderRadius: 18,
            boxShadow: "0 8px 28px rgba(0,0,0,0.08), 0 0 0 1px rgba(10,10,10,0.04)",
          }}
        >
          <header
            style={{
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "0 16px",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <HdMascot pose="03-salut" size={40} />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Assistant TARINEO</p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 11,
                    color: C.muted,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {COPY.copiloteAsk}
                  <span>·</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: "#22C55E" }} />
                    Prêt
                  </span>
                </p>
              </div>
            </div>
            <span style={{ fontSize: 18, color: C.muted, lineHeight: 1 }}>×</span>
          </header>

          <div style={{ padding: "16px 16px 18px" }}>
            <p style={{ margin: "0 0 4px", fontSize: 14 }}>Bonjour Noam.</p>
            <p style={{ margin: "0 0 16px", fontSize: 14, color: C.muted }}>{COPY.copiloteAsk}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {COPILOTE_ACTIONS.map((action, i) => {
                const start = 20 + i * 8;
                const op = interpolate(frame, [start, start + 12], [0, 1], clamp);
                const active = i === selected && selectOn > 0.2;
                return (
                  <div
                    key={action}
                    style={{
                      opacity: op,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: active
                        ? `1.5px solid rgba(255,107,26,${0.3 + selectOn * 0.5})`
                        : `1px solid ${C.border}`,
                      background: active ? "rgba(255,107,26,0.06)" : "transparent",
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      color: active ? C.accent : C.ink,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transform: `scale(${active ? 1.015 : 1})`,
                      boxShadow: active ? SHADOW : "none",
                    }}
                  >
                    <span>{action}</span>
                    <span aria-hidden>→</span>
                  </div>
                );
              })}
            </div>
          </div>
        </SoftCard>
      </div>
    </div>
  );
}
