"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export function MiniBarChart({
  data,
  className,
  barClassName = "bg-[#FF6B1A]",
}: {
  data: { label: string; value: number }[];
  className?: string;
  barClassName?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={cn("flex h-[140px] items-end gap-1.5 sm:gap-2", className)} role="img" aria-label="Graphique en barres">
      {data.map((d) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <div
            className={cn("w-full max-w-[48px] rounded-t-md transition-[height]", barClassName)}
            style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="max-w-full truncate text-[10px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function MiniLineChart({
  points,
  className,
}: {
  points: { x: number; y: number }[];
  className?: string;
}) {
  if (points.length < 2) {
    return <p className="text-[13px] text-muted-foreground">Pas assez de données.</p>;
  }
  const w = 320;
  const h = 120;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const norm = points
    .map((p) => {
      const x = ((p.x - minX) / (maxX - minX || 1)) * (w - 16) + 8;
      const y = h - 8 - ((p.y - minY) / (maxY - minY || 1)) * (h - 16);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-[120px] w-full text-[#FF6B1A]", className)} role="img" aria-label="Graphique linéaire">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={norm} />
    </svg>
  );
}

export function DonutChart({
  segments,
  className,
  center,
  size = 112,
}: {
  segments: { label: string; value: number; color: string }[];
  className?: string;
  center?: { primary: string; secondary?: string };
  size?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;
  const stops = segments.map((s) => {
    const start = (acc / total) * 100;
    acc += s.value;
    const end = (acc / total) * 100;
    return `${s.color} ${start}% ${end}%`;
  });
  const ring = Math.round(size * 0.14);
  return (
    <div className={cn("flex items-center gap-6", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `conic-gradient(${stops.join(", ")})` }}
          role="img"
          aria-label="Graphique en anneau"
        />
        <div
          className="absolute rounded-full bg-surface"
          style={{
            inset: ring,
          }}
        />
        {center ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="font-display text-[20px] font-semibold tabular-nums tracking-tight text-ink">{center.primary}</p>
            {center.secondary ? (
              <p className="text-[11px] text-muted-foreground">{center.secondary}</p>
            ) : null}
          </div>
        ) : null}
      </div>
      <ul className="min-w-0 flex-1 space-y-2.5 text-[13px]">
        {segments.map((s) => (
          <li key={s.label} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3">
            <span className="flex min-w-0 items-center gap-2 truncate text-ink">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
              {s.label}
            </span>
            <span className="font-semibold tabular-nums text-ink">{s.value}</span>
            <span className="w-10 text-right tabular-nums text-muted-foreground">
              {Math.round((s.value / total) * 100)} %
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TrendAreaChart({
  data,
  className,
  formatY,
}: {
  data: { label: string; value: number }[];
  className?: string;
  formatY?: (v: number) => string;
}) {
  const gradId = useId();
  if (data.length < 2) {
    return <p className="text-[13px] text-muted-foreground">Pas assez de données.</p>;
  }
  const w = 400;
  const h = 160;
  const pad = { t: 12, r: 8, b: 28, l: 36 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const ys = data.map((d) => d.value);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 1);
  const rangeY = maxY - minY || 1;
  const points = data.map((d, i) => {
    const x = pad.l + (i / (data.length - 1)) * innerW;
    const y = pad.t + innerH - ((d.value - minY) / rangeY) * innerH;
    return { x, y, ...d };
  });
  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pad.l},${pad.t + innerH} ${line} ${points[points.length - 1].x},${pad.t + innerH}`;
  const yTicks = 4;
  const fmt = formatY ?? ((v: number) => `${Math.round(v)}`);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-[180px] w-full", className)} role="img" aria-label="Courbe d’évolution">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6B1A" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FF6B1A" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const v = minY + (rangeY * i) / yTicks;
        const y = pad.t + innerH - ((v - minY) / rangeY) * innerH;
        return (
          <g key={i}>
            <line x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="currentColor" strokeOpacity={0.08} />
            <text x={pad.l - 6} y={y + 4} textAnchor="end" className="fill-muted-foreground text-[9px]">
              {fmt(v)}
            </text>
          </g>
        );
      })}
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline fill="none" stroke="#FF6B1A" strokeWidth="2.25" points={line} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 3} fill="#FF6B1A" />
      ))}
      {points.map((p) => (
        <text
          key={`${p.label}-x`}
          x={p.x}
          y={h - 6}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px]"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}
