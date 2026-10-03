import Link from "next/link";
import { Package } from "lucide-react";
import type { TarineoProduct } from "@/components/tarineo/types";
import { R } from "@/lib/routes";
import { productSlug } from "@/lib/tarineo/product-slug";
import { euro } from "@/lib/site/tarineo";

export function AchatsProductList({ products }: { products: TarineoProduct[] }) {
  if (!products.length) {
    return <p className="p-4 text-[13px] text-muted-foreground">Aucun produit pour l’instant.</p>;
  }
  return (
    <ul className="divide-y divide-line">
      {products.map((p) => (
        <li key={p.id}>
          <Link
            href={R.achatsProduit(productSlug(p.name))}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted-foreground">
              <Package className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-ink">{p.name}</p>
              {p.lastPriceHt != null ? (
                <p className="text-[12px] text-muted-foreground">Dernier prix HT {euro(p.lastPriceHt)}</p>
              ) : (
                <p className="text-[12px] text-muted-foreground">Voir l’historique et les hausses</p>
              )}
            </div>
            <span className="shrink-0 text-[12px] font-medium text-tarineo-orange">Fiche →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
