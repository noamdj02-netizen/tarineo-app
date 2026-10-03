"use client";

import { TrendAreaChart } from "@/components/tarineo/charts/chart-primitives";
import { TarineoPanelCard } from "@/components/tarineo/cards/tarineo-panel-card";
import type { SalesPoint } from "@/components/tarineo/types";
import { euroInt, variation } from "@/lib/site/tarineo";
import { ArrowUpRight } from "lucide-react";

export function SalesEvolutionChart({
  points,
  title = "Évolution des ventes",
}: {
  points: SalesPoint[];
  title?: string;
}) {
  if (!points.length) {
    return (
      <TarineoPanelCard title={title}>
        <p className="px-5 py-6 text-[13px] text-muted-foreground">Pas de données sur la période.</p>
      </TarineoPanelCard>
    );
  }
  const series = points.map((p) => ({ label: p.label, value: p.amount }));
  const first = points[0].amount;
  const last = points[points.length - 1].amount;
  const pct = variation(first, last);

  return (
    <TarineoPanelCard title={title}>
      <div className="px-5 pb-5 pt-2">
        {points.length >= 2 ? (
          <div className="mb-2 flex justify-end">
            <span className="inline-flex items-center gap-1 rounded-xl border border-[#FF6B1A]/25 bg-[#FF6B1A]/8 px-3 py-1.5 text-[13px] font-semibold tabular-nums text-[#E85A12]">
              {pct >= 0 ? "+" : ""}
              {Math.round(pct)} %
              <ArrowUpRight className="size-3.5" aria-hidden />
            </span>
          </div>
        ) : null}
        <TrendAreaChart data={series} formatY={(v) => euroInt(v)} />
      </div>
    </TarineoPanelCard>
  );
}
