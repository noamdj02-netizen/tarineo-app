import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { fontGrotesk, fontMono, fontSans } from "../fonts";
import { EASE } from "../motion";
import { C, SHADOW_SOFT, TABS } from "../theme";

export type Tab = (typeof TABS)[number];

function Icon({ d }: { d: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

const ICONS: Record<Tab, string> = {
  Accueil: "M4 10.5 12 3l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z",
  Projets: "M3 4h8v8H3zM13 4h8v5h-8zM13 11h8v9h-8zM3 14h8v6H3z",
  Ressources: "M4 5h16v4H4zM4 11h16v4H4zM4 17h10v3H4z",
  Outils: "M14 7 8 13l3 3 6-6M9 14l-4 4",
  Schémas: "M4 6h7v7H4zM13 11h7v7h-7zM11 10v3h2",
  Anatomie: "M4 5h16v4H4zM4 11h16v3H4zM4 16h16v3H4z",
  Composants: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  "Composants 2": "M8 3 3 8l5 5 5-5zM16 11l-5 5 5 5 5-5z",
  Thèmes: "M12 3v3M12 18v3M3 12h3M18 12h3M6.2 6.2l2.1 2.1M15.7 15.7l2.1 2.1M17.8 6.2l-2.1 2.1M8.3 15.7l-2.1 2.1",
  "Mes sites": "M10 4h10v10h-4M4 10h10v10H4z",
};

/** Cockpit réel : sidebar noire + carte blanche, comme app/(app)/layout. */
export function AppShell({
  tab,
  children,
}: {
  tab: Tab;
  children: React.ReactNode;
}) {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        fontFamily: fontSans,
        opacity: enter,
      }}
    >
      <div style={{ display: "flex", height: "100%" }}>
        <aside
          style={{
            width: 252,
            flex: "none",
            background: C.side,
            color: C.sideInk,
            padding: "24px 16px 16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontFamily: fontGrotesk,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              padding: "0 12px",
              minHeight: 44,
              display: "flex",
              alignItems: "center",
            }}
          >
            Navpit<span style={{ color: C.accent2 }}>.</span>
          </div>
          <div
            style={{
              fontFamily: fontMono,
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: C.sideMuted,
              margin: "32px 0 8px",
              padding: "0 12px",
            }}
          >
            / Navigation ///
          </div>
          <nav style={{ flex: 1 }}>
            {TABS.map((label) => {
              const on = label === tab;
              return (
                <div
                  key={label}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    minHeight: 40,
                    padding: "0 12px",
                    borderRadius: 12,
                    fontFamily: fontMono,
                    fontSize: 11.5,
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: on ? C.sideInk : C.sideMuted,
                    background: on
                      ? "linear-gradient(90deg, rgba(255,255,255,0.16), rgba(255,255,255,0.07) 55%, transparent)"
                      : "transparent",
                    border: on ? "1px solid rgba(255,255,255,0.10)" : "1px solid transparent",
                  }}
                >
                  <Icon d={ICONS[label]} />
                  {label}
                </div>
              );
            })}
          </nav>
          <div
            style={{
              marginTop: 16,
              borderRadius: 18,
              border: `1px solid ${C.sideLine}`,
              background: "rgba(255,255,255,0.04)",
              padding: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span
                style={{
                  fontFamily: fontMono,
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: C.sideMuted,
                }}
              >
                / Démarrage
              </span>
              <span style={{ fontFamily: fontMono, fontSize: 12, fontVariantNumeric: "tabular-nums" }}>3/5</span>
            </div>
            <div style={{ marginTop: 12, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.10)" }}>
              <div
                style={{
                  width: "60%",
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg, rgba(255,255,255,0.6), #fff)",
                }}
              />
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
              Ensuite : Sauver une ressource
            </div>
          </div>
        </aside>

        <div style={{ flex: 1, minWidth: 0, padding: "10px 10px 10px 0", display: "flex" }}>
          <div
            style={{
              flex: 1,
              background: C.surface,
              borderRadius: 18,
              boxShadow: SHADOW_SOFT,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <header
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                height: 60,
                padding: "0 24px",
                borderBottom: `1px solid ${C.line}`,
              }}
            >
              <div
                style={{
                  height: 40,
                  width: 400,
                  borderRadius: 999,
                  border: `1px solid ${C.line}`,
                  background: C.surface2,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0 16px",
                  color: C.muted,
                  fontSize: 14,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20 16.5 16.5" />
                </svg>
                <span style={{ flex: 1 }}>Rechercher…</span>
                <span
                  style={{
                    fontFamily: fontMono,
                    fontSize: 10.5,
                    border: `1px solid ${C.line}`,
                    background: C.surface,
                    borderRadius: 6,
                    padding: "2px 6px",
                    color: "rgba(17,17,17,0.7)",
                  }}
                >
                  ⌘K
                </span>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${C.line}`,
                    background: C.surface2,
                    padding: "6px 12px",
                    fontFamily: fontMono,
                    fontSize: 10.5,
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(17,17,17,0.7)",
                  }}
                >
                  Plan gratuit · Passer Pro
                </div>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    background: C.ink,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontFamily: fontMono,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  N
                </div>
              </div>
            </header>
            <main
              style={{
                flex: 1,
                padding: "24px 32px 32px",
                display: "flex",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <div style={{ width: "100%", maxWidth: 1080 }}>{children}</div>
            </main>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

export function MonoLabel({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div
      style={{
        fontFamily: fontMono,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: light ? "rgba(255,255,255,0.55)" : C.muted,
      }}
    >
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: "focus" | "pause" | "fini" }) {
  const map = {
    focus: { bg: C.focusSoft, ink: C.focusInk, dot: C.focus },
    pause: { bg: C.pauseSoft, ink: C.pauseInk, dot: C.pause },
    fini: { bg: C.finiSoft, ink: C.finiInk, dot: C.fini },
  } as const;
  const s = map[status];
  const label = status === "focus" ? "Focus" : status === "pause" ? "En pause" : "Fini";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        borderRadius: 999,
        padding: "4px 10px",
        background: s.bg,
        color: s.ink,
        fontFamily: fontMono,
        fontSize: 10.5,
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        boxShadow: `inset 0 0 0 1px ${s.dot}33`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: s.dot,
          boxShadow: `0 0 0 3px ${s.dot}38`,
        }}
      />
      {label}
    </span>
  );
}
