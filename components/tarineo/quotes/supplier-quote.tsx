import { Package } from "lucide-react";
import type { SupplierQuoteLine } from "@/components/tarineo/types";
import { euro } from "@/lib/site/tarineo";

export function SupplierQuote({ lines, className }: { lines: SupplierQuoteLine[]; className?: string }) {
  if (!lines.length) {
    return <p className="text-[13px] text-muted-foreground">Aucune ligne produit.</p>;
  }
  return (
    <ul className={className}>
      {lines.map((l) => (
        <li
          key={l.id}
          className="flex items-center gap-3 border-b border-line px-3 py-2.5 last:border-0 sm:px-4"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted-foreground">
            <Package className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-ink">{l.name}</p>
            {l.reference ? <p className="text-[12px] text-muted-foreground">Réf. {l.reference}</p> : null}
          </div>
          <p className="shrink-0 text-[14px] font-medium tabular-nums text-ink">
            {euro(l.priceHt)}
            {l.unit ? <span className="text-[12px] font-normal text-muted-foreground"> / {l.unit}</span> : null}
          </p>
        </li>
      ))}
    </ul>
  );
}
