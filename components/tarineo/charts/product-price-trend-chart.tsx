"use client";

import { TrendAreaChart } from "@/components/tarineo/charts/chart-primitives";
import type { PriceHistoryPoint } from "@/components/tarineo/types";
import { euro, signedPct, variation } from "@/lib/site/tarineo";

export function ProductPriceTrendChart({ points }: { points: PriceHistoryPoint[] }) {
  if (points.length < 2) {
    return <p className="px-5 py-6 text-[13px] text-muted-foreground">Historique insuffisant pour ce produit.</p>;
  }
  const series = points.map((p) => ({
    label: p.label ?? p.date.slice(5, 7),
    value: p.priceHt,
  }));
  const first = points[0].priceHt;
  const last = points[points.length - 1].priceHt;
  const pct = variation(first, last);

  return (
    <div className="px-5 pb-5 pt-2">
      <div className="mb-2 flex justify-end">
        <span className="inline-flex flex-col items-end rounded-xl bg-[#FF6B1A] px-3 py-1.5 text-white">
          <span className="text-[15px] font-semibold tabular-nums">{euro(last)}</span>
          <span className="text-[11px] opacity-90">{signedPct(pct)}</span>
        </span>
      </div>
      <TrendAreaChart data={series} formatY={(v) => euro(v)} />
    </div>
  );
}
