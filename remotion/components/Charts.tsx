import { interpolate } from "remotion";
import { COLORS } from "../constants";
import { EASE } from "../animations";
import { CHART_POINTS } from "../data";

/** Sparkline minimal qui se dessine progressivement. */
export function Sparkline({
  frame,
  start,
  duration = 36,
  width = 220,
  height = 56,
  accent = false,
}: {
  frame: number;
  start: number;
  duration?: number;
  width?: number;
  height?: number;
  accent?: boolean;
}) {
  const progress = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  const pts = CHART_POINTS;
  const step = width / (pts.length - 1);
  const path = pts
    .map((y, i) => {
      const x = i * step;
      const py = height - y * (height - 8) - 4;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${py.toFixed(1)}`;
    })
    .join(" ");

  const pathLen = 420;
  const stroke = accent ? COLORS.accent : COLORS.text;
  const fill = accent ? "rgba(236,88,33,0.08)" : "rgba(17,17,17,0.04)";

  const area = `${path} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={area} fill={fill} opacity={progress} />
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLen}
        strokeDashoffset={pathLen * (1 - progress)}
      />
      {progress > 0.92 ? (
        <circle
          cx={(pts.length - 1) * step}
          cy={height - pts[pts.length - 1] * (height - 8) - 4}
          r={3.5}
          fill={stroke}
        />
      ) : null}
    </svg>
  );
}

/** Barres avant / après marge. */
export function MarginBars({
  frame,
  start,
  before,
  after,
  width = 320,
}: {
  frame: number;
  start: number;
  before: number;
  after: number;
  width?: number;
}) {
  const t = interpolate(frame, [start, start + 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const max = Math.max(before, after) * 1.15;
  const hBefore = (before / max) * 120 * t;
  const hAfter = (after / max) * 120 * t;

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 28, width }}>
      <Bar label="Avant" value={`${before.toFixed(1)} %`} height={hBefore} muted />
      <Bar label="Après" value={`${after.toFixed(1)} %`} height={hAfter} accent />
    </div>
  );
}

function Bar({
  label,
  value,
  height,
  muted,
  accent,
}: {
  label: string;
  value: string;
  height: number;
  muted?: boolean;
  accent?: boolean;
}) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em" }}>{value}</span>
      <div
        style={{
          width: "100%",
          height: 120,
          display: "flex",
          alignItems: "flex-end",
          borderRadius: 10,
          background: COLORS.bg,
          border: `1px solid ${COLORS.border}`,
          overflow: "hidden",
          padding: 6,
        }}
      >
        <div
          style={{
            width: "100%",
            height,
            borderRadius: 6,
            background: accent ? COLORS.accent : muted ? "rgba(17,17,17,0.18)" : COLORS.text,
          }}
        />
      </div>
      <span style={{ fontSize: 12, color: COLORS.muted }}>{label}</span>
    </div>
  );
}
