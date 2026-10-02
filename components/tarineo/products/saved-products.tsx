import { Package, Plus } from "lucide-react";
import type { TarineoProduct } from "@/components/tarineo/types";
import { Button } from "@/components/ui/button";

export function SavedProducts({
  products,
  onAdd,
}: {
  products: TarineoProduct[];
  onAdd?: (product: TarineoProduct) => void;
}) {
  if (!products.length) {
    return <p className="p-4 text-[13px] text-muted-foreground">Aucun produit enregistré pour l’instant.</p>;
  }
  return (
    <ul className="divide-y divide-line">
      {products.map((p) => (
        <li key={p.id} className="flex items-center gap-3 px-4 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted-foreground">
            <Package className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-ink">{p.name}</p>
            <p className="text-[12px] text-muted-foreground">
              {[p.supplierRef ? `Fourn. ${p.supplierRef}` : null, p.distributorRef ? `Dist. ${p.distributorRef}` : null]
                .filter(Boolean)
                .join(" · ") || "Références à compléter"}
            </p>
          </div>
          {onAdd ? (
            <Button type="button" size="sm" variant="outline" className="shrink-0" onClick={() => onAdd(p)}>
              <Plus data-icon="inline-start" className="size-3.5" />
              Ajouter
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
