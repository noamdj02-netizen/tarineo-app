import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../animations";
import { fontSans } from "../fonts";
import { C } from "./constants";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

export function MeshBg({ blueish = true }: { blueish?: boolean }) {
  return (
    <AbsoluteFill style={{ backgroundColor: C.canvas }}>
      <AbsoluteFill
        style={{
          background: blueish
            ? "radial-gradient(ellipse 70% 60% at 55% 45%, rgba(170,200,235,0.22) 0%, transparent 70%), radial-gradient(ellipse 45% 40% at 40% 60%, rgba(255,200,160,0.08) 0%, transparent 60%)"
            : "radial-gradient(ellipse 55% 45% at 50% 48%, rgba(255,107,26,0.08) 0%, transparent 70%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.4,
          backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 10px, ${C.grid} 10px, ${C.grid} 11px)`,
        }}
      />
    </AbsoluteFill>
  );
}

export function Stage({ children }: { children: ReactNode }) {
  return (
    <AbsoluteFill style={{ fontFamily: fontSans, color: C.ink }}>
      <MeshBg />
      {children}
    </AbsoluteFill>
  );
}

export function GuideCross({ opacity = 0.35 }: { opacity?: number }) {
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      <div
        style={{
          position: "absolute",
          left: "33.33%",
          top: 0,
          bottom: 0,
          borderLeft: `1px dashed rgba(10,10,10,0.12)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "66.66%",
          top: 0,
          bottom: 0,
          borderLeft: `1px dashed rgba(10,10,10,0.12)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          borderTop: `1px dashed rgba(10,10,10,0.12)`,
        }}
      />
    </AbsoluteFill>
  );
}

export function PillBar({
  children,
  style,
  width = 460,
}: {
  children: ReactNode;
  style?: CSSProperties;
  width?: number;
}) {
  return (
    <div
      style={{
        width,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        background: C.white,
        borderRadius: 999,
        padding: "12px 14px 12px 16px",
        boxShadow: "0 0 0 1px rgba(10,10,10,0.05), 0 12px 36px rgba(10,10,10,0.1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function RoundBtn({
  children,
  dark = false,
  size = 34,
}: {
  children: ReactNode;
  dark?: boolean;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        background: dark ? C.ink : C.soft,
        color: dark ? C.white : C.muted,
        fontSize: size * 0.42,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

export function Cursor({ x, y, opacity = 1 }: { x: number; y: number; opacity?: number }) {
  return (
    <svg
      width={22}
      height={28}
      viewBox="0 0 22 28"
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.28))",
        zIndex: 60,
        pointerEvents: "none",
      }}
    >
      <path
        d="M1 1 L1 22 L7 17 L11 26 L14.5 24.5 L10.5 16 L18 16 Z"
        fill="#fff"
        stroke="#0A0A0A"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function enterSpring(
  frame: number,
  start: number,
  fps: number,
): number {
  // lightweight spring substitute using interpolate for fidelity of timing
  return interpolate(frame, [start, start + 14], [0, 1], clamp);
}

export { clamp, EASE };
