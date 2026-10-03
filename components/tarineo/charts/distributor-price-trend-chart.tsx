"use client";

import { TrendAreaChart } from "@/components/tarineo/charts/chart-primitives";
import type { SalesPoint } from "@/components/tarineo/types";
import { signedPct, variation } from "@/lib/site/tarineo";
import { ArrowUpRight } from "lucide-react";

export function DistributorPriceTrendChart({ points }: { points: SalesPoint[] }) {
  if (points.length < 2) {
    return <p className="px-5 py-6 text-[13px] text-muted-foreground">Pas de données sur la période.</p>;
  }
  const series = points.map((p) => ({ label: p.label, value: p.amount }));
  const first = points[0].amount;
  const last = points[points.length - 1].amount;
  const pct = variation(first, last);

  return (
    <div className="px-5 pb-5 pt-2">
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="sr-only">Évolution des prix distributeurs</p>
        <span
          className="ml-auto inline-flex flex-col items-end rounded-xl border border-[#FF6B1A]/25 bg-[#FF6B1A]/8 px-3 py-1.5"
        >
          <span className="inline-flex items-center gap-1 text-[14px] font-semibold tabular-nums text-[#E85A12]">
            {signedPct(pct)}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </span>
          <span className="text-[11px] text-muted-foreground">sur la période</span>
        </span>
      </div>
      <TrendAreaChart
        data={series}
        formatY={(v) => (v >= 0 ? `+${Math.round(v)}%` : `${Math.round(v)}%`)}
      />
    </div>
  );
}
