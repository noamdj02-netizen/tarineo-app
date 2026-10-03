"use client";

import type { InvoiceExportKind } from "@/components/tarineo/types";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

const OPTIONS: { id: InvoiceExportKind; label: string }[] = [
  { id: "distributor", label: "Factures distributeur (achats)" },
  { id: "client", label: "Factures client (ventes)" },
];

export function InvoiceTypeSelector({
  selected,
  onChange,
}: {
  selected: InvoiceExportKind[];
  onChange: (next: InvoiceExportKind[]) => void;
}) {
  function toggle(id: InvoiceExportKind) {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((o) => {
          const on = selected.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => toggle(o.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-orange/30",
                on ? "border-[#FF6B1A]/40 bg-[#FF6B1A]/6" : "border-[#FF6B1A]/20 bg-surface hover:bg-surface-2",
              )}
            >
              <Checkbox checked={on} aria-label={o.label} />
              <span className="text-[14px] font-medium text-ink">{o.label}</span>
            </button>
          );
        })}
      </div>
      <p className="flex items-start gap-2 rounded-xl bg-[#FF6B1A]/8 px-3.5 py-2.5 text-[12.5px] text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-[#E85A12]" aria-hidden />
        Vous pouvez choisir un seul type de factures ou les deux en même temps.
      </p>
    </div>
  );
}
