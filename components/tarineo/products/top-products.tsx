import Link from "next/link";
import { ProductCategoryIcon } from "@/components/tarineo/product-category-icon";
import { TarineoPanelCard } from "@/components/tarineo/cards/tarineo-panel-card";
import { productSlug } from "@/lib/tarineo/product-slug";
import { R } from "@/lib/routes";
import { euroInt } from "@/lib/site/tarineo";

export function TopProducts({
  items,
  title = "Top produits vendus",
  href = R.achatsProduits,
}: {
  items: { id: string; name: string; amountHt: number; qty: number }[];
  title?: string;
  href?: string;
}) {
  if (!items.length) {
    return (
      <TarineoPanelCard title={title} href={href}>
        <p className="px-5 py-6 text-[13px] text-muted-foreground">Pas encore d’achats enregistrés.</p>
      </TarineoPanelCard>
    );
  }
  return (
    <TarineoPanelCard title={title} href={href}>
      <ol className="divide-y divide-line">
        {items.map((item, i) => (
          <li key={item.id}>
            <Link
              href={R.achatsProduit(productSlug(item.name))}
              className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2/80"
            >
              <span className="w-4 shrink-0 text-center text-[13px] font-medium tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <ProductCategoryIcon name={item.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-ink">{item.name}</p>
              </div>
              <p className="hidden shrink-0 text-[13px] text-muted-foreground sm:block">
                {item.qty} vente{item.qty > 1 ? "s" : ""}
              </p>
              <p className="shrink-0 text-[14px] font-semibold tabular-nums text-ink">{euroInt(item.amountHt)}</p>
            </Link>
          </li>
        ))}
      </ol>
    </TarineoPanelCard>
  );
}
