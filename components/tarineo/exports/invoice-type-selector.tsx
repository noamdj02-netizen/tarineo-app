"use client";

import type { InvoiceExportKind } from "@/components/tarineo/types";
import { cn } from "@/lib/utils";

const OPTIONS: { id: InvoiceExportKind; label: string; hint: string }[] = [
  { id: "distributor", label: "Factures distributeur", hint: "Achats fournisseurs" },
  { id: "client", label: "Factures client", hint: "Ventes émises" },
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
    <div className="grid gap-2 sm:grid-cols-2">
      {OPTIONS.map((o) => {
        const on = selected.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => toggle(o.id)}
            className={cn(
              "rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-orange/30",
              on ? "border-[#FF6B1A] bg-[#FF6B1A]/8" : "border-line bg-surface hover:bg-surface-2",
            )}
          >
            <p className="text-[14px] font-medium text-ink">{o.label}</p>
            <p className="text-[12px] text-muted-foreground">{o.hint}</p>
          </button>
        );
      })}
    </div>
  );
}
