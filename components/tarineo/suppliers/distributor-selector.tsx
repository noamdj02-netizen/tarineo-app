"use client";

import type { TarineoDistributor } from "@/components/tarineo/types";
import { Checkbox } from "@/components/ui/checkbox";
import { SupplierLogo } from "@/components/site/supplier-logo";

export function DistributorSelector({
  distributors,
  selectedIds,
  onChange,
}: {
  distributors: TarineoDistributor[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    if (selectedIds.includes(id)) onChange(selectedIds.filter((x) => x !== id));
    else onChange([...selectedIds, id]);
  }
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {distributors.map((d) => {
        const checked = selectedIds.includes(d.id);
        return (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => toggle(d.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 text-left transition hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-orange/30"
            >
              <Checkbox checked={checked} aria-label={`Sélectionner ${d.name}`} />
              <SupplierLogo name={d.name} size={32} />
              <span className="text-[14px] font-medium text-ink">{d.name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
