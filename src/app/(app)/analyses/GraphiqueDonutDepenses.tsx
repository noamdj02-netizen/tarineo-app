"use client";

import type { TrancheDepense } from "@/lib/analysesPage";

const euros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export function GraphiqueDonutDepenses({
  tranches,
  total,
}: {
  tranches: TrancheDepense[];
  total: number;
}) {
  if (tranches.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">Aucune dépense enregistrée sur la période.</p>
    );
  }

  const rayon = 54;
  const cx = 70;
  const cy = 70;

  const { segments } = tranches.reduce<{
    segments: Array<TrancheDepense & { d: string }>;
    angle: number;
  }>(
    (acc, t) => {
      const sweep = (t.pct / 100) * 360;
      const start = acc.angle;
      const end = acc.angle + sweep;
      const large = sweep > 180 ? 1 : 0;
      const rad = (deg: number) => (deg * Math.PI) / 180;
      const x1 = cx + rayon * Math.cos(rad(start));
      const y1 = cy + rayon * Math.sin(rad(start));
      const x2 = cx + rayon * Math.cos(rad(end));
      const y2 = cy + rayon * Math.sin(rad(end));
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${rayon} ${rayon} 0 ${large} 1 ${x2} ${y2} Z`;
      return { segments: [...acc.segments, { ...t, d }], angle: end };
    },
    { segments: [], angle: -90 },
  );

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="relative mx-auto shrink-0 sm:mx-0">
        <svg width={140} height={140} viewBox="0 0 140 140" role="img" aria-label="Répartition des dépenses">
          {segments.map((s) => (
            <path key={s.nom} d={s.d} fill={s.couleur} />
          ))}
          <circle cx={cx} cy={cy} r={34} fill="var(--card)" />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</span>
          <span className="text-sm font-semibold text-foreground">{euros(total)}</span>
        </div>
      </div>

      <ul className="min-w-0 flex-1 flex flex-col gap-2">
        {tranches.map((t) => (
          <li key={t.nom} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: t.couleur }} />
              <span className="truncate text-foreground">{t.nom}</span>
              <span className="shrink-0 text-muted-foreground">{t.pct} %</span>
            </div>
            <span className="shrink-0 tabular-nums text-foreground">{euros(t.montant)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
