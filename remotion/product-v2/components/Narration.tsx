import type { CSSProperties, ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { fontSans } from "../../fonts";
import { DASH } from "../dashboard-tokens";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

export function Narration({
  pain,
  solution,
  start = 0,
  style,
}: {
  pain?: string;
  solution?: string;
  start?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const showSolution = solution && frame >= start + 18;
  const painOp = interpolate(frame, [start, start + 10], [0, 1], clamp);
  const solOp = interpolate(frame, [start + 18, start + 28], [0, 1], clamp);

  return (
    <div
      style={{
        position: "absolute",
        top: 36,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        zIndex: 20,
        pointerEvents: "none",
        fontFamily: fontSans,
        ...style,
      }}
    >
      {pain ? (
        <p
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: DASH.ink,
            opacity: showSolution ? interpolate(frame, [start + 18, start + 26], [1, 0.35], clamp) : painOp,
          }}
        >
          {pain}
        </p>
      ) : null}
      {solution ? (
        <p
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 550,
            color: DASH.orange,
            opacity: solOp,
            maxWidth: 720,
            textAlign: "center",
          }}
        >
          {solution}
        </p>
      ) : null}
    </div>
  );
}

export function PainCard({
  children,
  tone = "pain",
}: {
  children: ReactNode;
  tone?: "pain" | "ok";
}) {
  return (
    <div
      style={{
        background: tone === "pain" ? "rgba(239, 68, 68, 0.06)" : DASH.orangeSoft,
        border: `1px solid ${tone === "pain" ? "rgba(239, 68, 68, 0.2)" : DASH.line}`,
        borderRadius: 14,
        padding: "14px 18px",
        fontSize: 15,
        fontWeight: 600,
        color: DASH.ink,
      }}
    >
      {children}
    </div>
  );
}
