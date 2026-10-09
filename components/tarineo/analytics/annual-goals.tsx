"use client";

import { useState } from "react";
import { TarineoPanelCard } from "@/components/tarineo/cards/tarineo-panel-card";
import type { TarineoDistributor } from "@/components/tarineo/types";
import { SupplierSpendGauge } from "@/components/tarineo/suppliers/supplier-spend-gauge";
import { SupplierLogo } from "@/components/site/supplier-logo";

export function AnnualGoals({ distributors }: { distributors: TarineoDistributor[] }) {
  const [period, setPeriod] = useState<"month" | "year">("month");
  if (!distributors.length) {
    return (
      <TarineoPanelCard title="Objectifs d’achat">
        <p className="px-5 py-6 text-[13px] text-muted-foreground">Importez des factures pour suivre vos objectifs.</p>
      </TarineoPanelCard>
    );
  }
  return (
    <div className="card-soft overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="font-display text-[16px] font-semibold tracking-tight text-ink">Objectifs d’achat</h2>
        <div className="flex rounded-lg border border-line p-0.5 text-[12px]">
          <button
            type="button"
            onClick={() => setPeriod("month")}
            className={
              period === "month"
                ? "rounded-md bg-ink px-2.5 py-1 font-medium text-white"
                : "rounded-md px-2.5 py-1 text-muted-foreground"
            }
          >
            Mois
          </button>
          <button
            type="button"
            onClick={() => setPeriod("year")}
            className={
              period === "year"
                ? "rounded-md bg-ink px-2.5 py-1 font-medium text-white"
                : "rounded-md px-2.5 py-1 text-muted-foreground"
            }
          >
            Année
          </button>
        </div>
      </div>
      <ul className="divide-y divide-line">
        {distributors.map((d) => {
          const current = period === "month" ? (d.monthlyAmountHt ?? 0) : (d.amountHt ?? 0);
          const goal = period === "month" ? (d.monthlyGoalHt ?? null) : (d.goalHt ?? null);
          return (
            <li key={d.id} className="flex items-start gap-3 px-5 py-3.5">
              <SupplierLogo name={d.name} size={36} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-ink">{d.name}</p>
                <SupplierSpendGauge
                  label={period === "month" ? "Ce mois" : "Cette année"}
                  current={current}
                  goal={goal}
                  compact
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
