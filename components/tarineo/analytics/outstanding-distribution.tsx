"use client";

import { useState } from "react";
import { DonutChart } from "@/components/tarineo/charts/chart-primitives";
import { TarineoPanelCard } from "@/components/tarineo/cards/tarineo-panel-card";
import type { FamilyPerformanceRow, SalesPoint } from "@/components/tarineo/types";
import { euroInt } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

const FAMILY_COLORS = ["#FF6B1A", "#3B82F6", "#22C55E", "#8B5CF6", "#F59E0B", "#94A3B8"];

export function OutstandingDistribution({
  byFamily,
  byMonth,
}: {
  byFamily: FamilyPerformanceRow[];
  byMonth: SalesPoint[];
}) {
  const [tab, setTab] = useState<"family" | "month">("family");
  const familyRows = byFamily.slice(0, 4);
  const segments =
    tab === "family"
      ? familyRows.map((f, i) => ({
          label: f.family,
          value: f.amountHt,
          color: FAMILY_COLORS[i % FAMILY_COLORS.length],
        }))
      : byMonth.slice(-4).map((m, i) => ({
          label: m.label,
          value: m.amount,
          color: FAMILY_COLORS[i % FAMILY_COLORS.length],
        }));

  if (!segments.length) {
    return (
      <TarineoPanelCard title="Répartition de l'encours">
        <p className="px-5 py-6 text-[13px] text-muted-foreground">Pas encore de données.</p>
      </TarineoPanelCard>
    );
  }

  const centerTotal = segments.reduce((s, x) => s + x.value, 0);

  return (
    <div className="card-soft overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="font-display text-[16px] font-semibold tracking-tight text-ink">Répartition de l&apos;encours</h2>
        <div className="flex gap-4 text-[13px] font-medium">
          <button
            type="button"
            onClick={() => setTab("family")}
            className={cn(
              "border-b-2 pb-1 transition-colors",
              tab === "family" ? "border-[#FF6B1A] text-[#E85A12]" : "border-transparent text-muted-foreground",
            )}
          >
            Par famille
          </button>
          <button
            type="button"
            onClick={() => setTab("month")}
            className={cn(
              "border-b-2 pb-1 transition-colors",
              tab === "month" ? "border-[#FF6B1A] text-[#E85A12]" : "border-transparent text-muted-foreground",
            )}
          >
            Par mois
          </button>
        </div>
      </div>
      <div className="p-5">
        <DonutChart
          segments={segments}
          size={140}
          center={{ primary: euroInt(centerTotal), secondary: "encours" }}
        />
      </div>
    </div>
  );
}
