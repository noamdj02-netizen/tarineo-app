"use client";

import type { SerieEvolutionPrix } from "@/lib/analysesPage";

const W = 520;
const H = 220;
const PAD = { top: 16, right: 12, bottom: 28, left: 40 };
const Y_TICKS = [-10, 0, 10, 20, 30];

export function GraphiqueEvolutionPrix({ series }: { series: SerieEvolutionPrix[] }) {
  if (series.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Importez des factures ou bons de commande pour voir l&apos;évolution des prix.
      </p>
    );
  }

  const moisLabels = series[0]?.points.map((p) => p.label) ?? [];
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const yMin = -10;
  const yMax = 30;

  const xAt = (i: number) => PAD.left + (i / Math.max(moisLabels.length - 1, 1)) * plotW;
  const yAt = (v: number) => PAD.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[320px] w-full" role="img" aria-label="Évolution des prix par fournisseur">
        {Y_TICKS.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              y1={yAt(tick)}
              x2={W - PAD.right}
              y2={yAt(tick)}
              stroke="var(--app-chart-track)"
              strokeWidth={1}
            />
            <text x={PAD.left - 6} y={yAt(tick) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">
              {tick > 0 ? `+${tick}%` : `${tick}%`}
            </text>
          </g>
        ))}

        {series.map((s) => {
          const pts = s.points
            .map((p, i) => `${xAt(i)},${yAt(Math.max(yMin, Math.min(yMax, p.variationPct)))}`)
            .join(" ");
          return (
            <polyline
              key={s.nom}
              points={pts}
              fill="none"
              stroke={s.couleur}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {moisLabels.map((label, i) => (
          <text
            key={label}
            x={xAt(i)}
            y={H - 6}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {label}
          </text>
        ))}
      </svg>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {series.map((s) => (
          <div key={s.nom} className="flex items-center gap-2 text-xs text-foreground">
            <span className="size-2.5 rounded-full" style={{ background: s.couleur }} />
            {s.nom}
          </div>
        ))}
      </div>
    </div>
  );
}
