"use client";

import { useState } from "react";
import { TarineoPanelCard } from "@/components/tarineo/cards/tarineo-panel-card";
import type { TarineoDistributor } from "@/components/tarineo/types";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { euroInt } from "@/lib/site/tarineo";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const BAR_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-[#FF6B1A]", "bg-[#FF6B1A]", "bg-emerald-500"];

export function AnnualGoals({ distributors }: { distributors: TarineoDistributor[] }) {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  if (!distributors.length) {
    return (
      <TarineoPanelCard title="Vos objectifs annuels">
        <p className="px-5 py-6 text-[13px] text-muted-foreground">Importez des factures pour suivre vos objectifs.</p>
      </TarineoPanelCard>
    );
  }
  return (
    <div className="card-soft overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="font-display text-[16px] font-semibold tracking-tight text-ink">Vos objectifs annuels</h2>
        <label className="sr-only" htmlFor="goals-year">Année</label>
        <select
          id="goals-year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="h-9 rounded-lg border border-line bg-surface px-2.5 text-[13px] text-ink"
        >
          {[year, String(Number(year) - 1)].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <ul className="divide-y divide-line">
        {distributors.map((d, i) => {
          const goal = d.goalHt ?? 0;
          const current = d.amountHt ?? 0;
          const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
          const barColor = BAR_COLORS[i % BAR_COLORS.length];
          const badgeTone =
            barColor.includes("blue")
              ? "bg-blue-50 text-blue-600"
              : barColor.includes("emerald")
                ? "bg-emerald-50 text-emerald-600"
                : "bg-[#FF6B1A]/10 text-[#E85A12]";
          return (
            <li key={d.id}>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-surface-2/80"
              >
                <SupplierLogo name={d.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-ink">{d.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full", barColor)} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums", badgeTone)}>
                      {pct} %
                    </span>
                  </div>
                </div>
                <p className="hidden shrink-0 text-right text-[13px] tabular-nums sm:block">
                  <span className="font-semibold text-ink">{euroInt(current)}</span>
                  {goal ? <span className="text-muted-foreground"> / {euroInt(goal)}</span> : null}
                </p>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
