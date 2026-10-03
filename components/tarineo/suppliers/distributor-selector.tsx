"use client";

import { useMemo, useState } from "react";
import type { TarineoDistributor } from "@/components/tarineo/types";
import { Checkbox } from "@/components/ui/checkbox";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

export function DistributorSelector({
  distributors,
  selectedIds,
  onChange,
  invoiceCounts,
}: {
  distributors: TarineoDistributor[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  invoiceCounts?: Record<string, number>;
}) {
  const [open, setOpen] = useState(true);
  const allIds = useMemo(() => distributors.map((d) => d.id), [distributors]);
  const allMode = selectedIds.length === 0;

  function isChecked(id: string) {
    return allMode || selectedIds.includes(id);
  }

  function toggle(id: string) {
    if (allMode) {
      onChange(allIds.filter((x) => x !== id));
      return;
    }
    if (selectedIds.includes(id)) {
      const next = selectedIds.filter((x) => x !== id);
      onChange(next.length ? next : []);
    } else {
      const next = [...selectedIds, id];
      onChange(next.length === allIds.length ? [] : next);
    }
  }

  function toggleAll() {
    onChange([]);
  }

  function countFor(name: string) {
    const direct = invoiceCounts?.[name];
    if (direct != null) return direct;
    const lower = name.toLowerCase();
    for (const [k, v] of Object.entries(invoiceCounts ?? {})) {
      if (k.toLowerCase() === lower) return v;
    }
    return 0;
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 text-left"
      >
        <span className="inline-flex rounded-full bg-[#FF6B1A]/10 px-2.5 py-1 text-[12px] font-medium text-[#E85A12]">
          {allMode ? "Tous les distributeurs" : `${selectedIds.length} sélectionné(s)`}
        </span>
        {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
      </button>
      {open ? (
        <ul className="overflow-hidden rounded-xl border border-line">
          <li>
            <button
              type="button"
              onClick={toggleAll}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left",
                allMode ? "bg-[#FF6B1A]/8" : "bg-surface hover:bg-surface-2",
              )}
            >
              <Checkbox checked={allMode} aria-label="Tous les distributeurs" />
              <span className="text-[14px] font-medium text-ink">
                Tous les distributeurs ({distributors.length})
              </span>
            </button>
          </li>
          {distributors.map((d) => {
            const count = countFor(d.name);
            return (
              <li key={d.id} className="border-t border-line">
                <button
                  type="button"
                  onClick={() => toggle(d.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-2"
                >
                  <Checkbox checked={isChecked(d.id)} aria-label={`Sélectionner ${d.name}`} />
                  <SupplierLogo name={d.name} size={32} />
                  <span className="min-w-0 flex-1 text-[14px] font-medium text-ink">{d.name}</span>
                  {count ? (
                    <span className="text-[12px] text-muted-foreground tabular-nums">
                      ({count.toLocaleString("fr-FR")} factures)
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
