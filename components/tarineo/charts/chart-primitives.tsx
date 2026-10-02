"use client";

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
}: {
  segments: { label: string; value: number; color: string }[];
  className?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;
  const stops = segments.map((s) => {
    const start = (acc / total) * 100;
    acc += s.value;
    const end = (acc / total) * 100;
    return `${s.color} ${start}% ${end}%`;
  });
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div
        className="size-24 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops.join(", ")})` }}
        role="img"
        aria-label="Graphique en anneau"
      />
      <ul className="min-w-0 flex-1 space-y-1 text-[12px]">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 truncate text-ink">
              <span className="size-2 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
              {s.label}
            </span>
            <span className="tabular-nums text-muted-foreground">{Math.round((s.value / total) * 100)} %</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
