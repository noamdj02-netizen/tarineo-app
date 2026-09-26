import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  action,
  className,
  children,
}: {
  title?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("overflow-hidden rounded-[18px] border border-line bg-surface", className)}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="text-[15px] font-semibold tracking-[-0.02em]">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Kpi({
  label,
  value,
  hint,
  up,
  down,
}: {
  label: string;
  value: string;
  hint: string;
  up?: boolean;
  down?: boolean;
}) {
  return (
    <div className="min-w-0 px-4 py-3">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-[28px] leading-none font-semibold tracking-tightest tabular-nums">{value}</p>
      <p
        className={cn(
          "mt-1.5 text-[12px] tabular-nums",
          up && "text-st-focus-ink",
          down && "text-st-fini-ink",
          !up && !down && "text-muted-foreground",
        )}
      >
        {hint}
      </p>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-4 py-8 text-[14px] text-muted-foreground">{children}</p>;
}

export function ActivityChart({ points }: { points: { day: string; count: number }[] }) {
  const width = 720;
  const height = 200;
  const max = Math.max(1, ...points.map((point) => point.count));
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const coords = points.map((point, index) => {
    const x = index * step;
    const y = height - 18 - (point.count / max) * (height - 36);
    return `${x},${y}`;
  });
  const line = coords.length ? `M${coords.join(" L")}` : "";
  const area = line ? `${line} L${width},${height} L0,${height} Z` : "";
  const first = points[0]?.day ?? "";
  const last = points[points.length - 1]?.day ?? "";
  return (
    <div className="px-3 pt-3 pb-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full" role="img" aria-label="Activité utilisateurs">
        <line x1="0" y1={height - 16} x2={width} y2={height - 16} stroke="rgba(17,17,17,0.08)" />
        {area ? <path d={area} fill="var(--color-glow-2)" opacity="0.45" /> : null}
        {line ? (
          <path d={line} fill="none" stroke="var(--color-ink)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        ) : null}
      </svg>
      <div className="flex justify-between px-1 text-[11px] text-muted-foreground">
        <span>{first.slice(5)}</span>
        <span>{last.slice(5)}</span>
      </div>
    </div>
  );
}

export function Funnel({ steps }: { steps: { label: string; count: number; share: number }[] }) {
  const max = Math.max(1, ...steps.map((step) => step.share));
  return (
    <ol className="flex flex-col gap-3 px-4 py-4">
      {steps.map((step) => (
        <li key={step.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="text-[14px]">{step.label}</span>
            <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
              {step.share.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-pill bg-line">
            <i
              className="block h-full rounded-pill bg-ink"
              style={{ width: `${Math.max(3, (step.share / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Bars({ rows }: { rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  if (!rows.length) return <Empty>Pas encore de signal.</Empty>;
  return (
    <ul>
      {rows.map((row) => (
        <li key={row.label} className="relative">
          <div className="absolute inset-y-0 left-0 bg-[color-mix(in_srgb,var(--color-glow-2)_55%,transparent)]" style={{ width: `${(row.count / max) * 100}%` }} />
          <div className="relative flex items-center justify-between gap-3 px-4 py-2.5 text-[14px]">
            <span>{row.label}</span>
            <span className="tabular-nums text-muted-foreground">{row.count}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
