import Link from "next/link";
import { TarineoPanelCard } from "@/components/tarineo/cards/tarineo-panel-card";
import { ProductCategoryIcon } from "@/components/tarineo/product-category-icon";
import { R } from "@/lib/routes";
import { signedPct } from "@/lib/site/tarineo";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopPriceIncreases({
  items,
  title = "Principales hausses détectées",
  href = R.hausses,
  compact,
}: {
  items: {
    id: string;
    label: string;
    oldPrice: number;
    newPrice: number;
    pct: number;
    chantierName?: string | null;
    documentId?: string | null;
    reference?: string | null;
  }[];
  title?: string;
  href?: string;
  compact?: boolean;
}) {
  if (!items.length) {
    return (
      <TarineoPanelCard title={title} href={href}>
        <p className="px-5 py-6 text-[13px] text-muted-foreground">Aucune hausse détectée.</p>
      </TarineoPanelCard>
    );
  }
  return (
    <TarineoPanelCard title={title} href={href}>
      <ul className="divide-y divide-line">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.documentId ? R.piece(item.documentId) : href}
              className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2/80"
            >
              <ProductCategoryIcon name={item.label} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-ink">{item.label}</p>
                {!compact && item.reference ? (
                  <p className="text-[12px] text-muted-foreground">Réf. {item.reference}</p>
                ) : null}
                {compact && item.chantierName ? (
                  <p className="text-[12px] text-muted-foreground">{item.chantierName}</p>
                ) : null}
              </div>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#FF6B1A]/10 px-2.5 py-1 text-[12px] font-semibold tabular-nums text-[#E85A12]",
                )}
              >
                {signedPct(item.pct)}
                <ArrowUpRight className="size-3" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </TarineoPanelCard>
  );
}
