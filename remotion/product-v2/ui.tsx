import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { EASE } from "../animations";
import { TarineoLogoMark } from "../components/TarineoLogoMark";
import { fontSans } from "../fonts";
import { DASH } from "./dashboard-tokens";
import { NAV_MIRROR } from "./nav-mirror";
import { C, SHADOW } from "./constants";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

/** Chrome app — miroir sidebar claire + canvas accueil (`components/shell/sidebar.tsx`). */
export function ProductShell({
  children,
  activeNav = "Accueil",
  frameOffset = 0,
  width = 1320,
  height = 780,
  style,
  padding = 20,
}: {
  children: ReactNode;
  activeNav?: string;
  frameOffset?: number;
  width?: number;
  height?: number;
  style?: CSSProperties;
  padding?: number;
}) {
  const frame = useCurrentFrame() + frameOffset;
  const enter = interpolate(frame, [0, 12], [0, 1], clamp);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 22,
        overflow: "hidden",
        background: DASH.canvas,
        boxShadow: DASH.shadowSoft,
        fontFamily: fontSans,
        color: DASH.ink,
        display: "flex",
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [14, 0])}px) scale(${interpolate(enter, [0, 1], [0.988, 1])})`,
        ...style,
      }}
    >
      <aside
        style={{
          width: 252,
          flexShrink: 0,
          background: DASH.side,
          color: DASH.sideInk,
          padding: "12px 12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          borderRight: `1px solid ${DASH.sideLine}`,
        }}
      >
        <div style={{ height: 52, display: "flex", alignItems: "center", padding: "0 6px", gap: 8 }}>
          <TarineoLogoMark size={28} variant="light" />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em" }}>TARINEO</span>
        </div>
        <nav style={{ flex: 1, overflow: "hidden" }}>
          {NAV_MIRROR.map((section, si) => (
            <div key={section.id} style={{ marginTop: si > 0 ? 14 : 0 }}>
              <p
                style={{
                  margin: "0 0 6px",
                  padding: "0 10px",
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: DASH.sideHint,
                }}
              >
                {section.label}
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 2 }}>
                {section.items.map((item) => {
                  const active = item.label === activeNav;
                  return (
                    <li
                      key={`${section.id}-${item.label}`}
                      style={{
                        height: 34,
                        borderRadius: 10,
                        padding: item.indent ? "0 10px 0 22px" : "0 10px",
                        display: "flex",
                        alignItems: "center",
                        fontSize: 13,
                        fontWeight: active ? 600 : 500,
                        background: active ? DASH.sideActive : "transparent",
                        color: active ? DASH.orange : DASH.sideInk,
                      }}
                    >
                      {item.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ flex: 1, padding, overflow: "hidden", background: DASH.canvas }}>{children}</div>
      </div>
    </div>
  );
}

export function Stage({
  children,
  dark = false,
  style,
}: {
  children: ReactNode;
  dark?: boolean;
  style?: CSSProperties;
}) {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: dark ? C.dark : C.canvas,
        color: dark ? C.white : C.ink,
        fontFamily: fontSans,
        ...style,
      }}
    >
      {!dark ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(255,107,26,0.04) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
      ) : null}
      {children}
    </AbsoluteFill>
  );
}

export function Grain({ opacity = 0.022 }: { opacity?: number }) {
  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
}

export function Reveal({
  children,
  start,
  duration = 16,
  y = 16,
  blur = 6,
  style,
}: {
  children: ReactNode;
  start: number;
  duration?: number;
  y?: number;
  blur?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const t = [start, start + duration] as const;
  return (
    <div
      style={{
        opacity: interpolate(frame, t, [0, 1], clamp),
        transform: `translateY(${interpolate(frame, t, [y, 0], clamp)}px)`,
        filter: `blur(${interpolate(frame, t, [blur, 0], clamp)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SoftCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        boxShadow: SHADOW,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function HdMascot({
  pose = "03-salut",
  size = 220,
  style,
}: {
  pose?: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <Img
      src={staticFile(`illustrations/tarineo-hd/${pose}.png`)}
      style={{
        width: size,
        height: "auto",
        objectFit: "contain",
        imageRendering: "auto",
        ...style,
      }}
    />
  );
}
