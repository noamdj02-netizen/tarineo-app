import Link from "next/link";
import { Truck } from "lucide-react";
import {
  formatDeliveryDateFr,
  type UpcomingDelivery,
} from "@/lib/metier/delivery";
import { R } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function UpcomingDeliveries({
  items,
  title = "Livraisons prévues",
  className,
}: {
  items: UpcomingDelivery[];
  title?: string;
  className?: string;
}) {
  if (!items.length) return null;
  return (
    <section
      className={cn(
        "rounded-[16px] border border-brand-orange/30 bg-wash-orange/40 px-4 py-3.5",
        className,
      )}
      aria-label={title}
    >
      <div className="mb-2 flex items-center gap-2">
        <Truck className="size-3.5 text-[#FF6B1A]" aria-hidden />
        <p className="text-[11px] font-semibold tracking-[0.08em] text-[#FF6B1A] uppercase">{title}</p>
        <span className="ml-auto tabular-nums text-[12px] text-muted-foreground">{items.length}</span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={`${item.documentId}-${item.day}`}>
            <Link
              href={`/pieces/${item.documentId}`}
              className="flex items-start justify-between gap-3 rounded-[10px] px-1 py-1.5 transition-colors hover:bg-surface/70"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-medium text-ink">{item.title}</span>
                <span className="mt-0.5 block text-[12.5px] text-muted-foreground">
                  {[
                    item.partyName,
                    item.chantierName
                      ? `Chantier ${item.chantierName}`
                      : item.chantierSlug
                        ? "Chantier lié"
                        : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Préparer la réception"}
                </span>
              </span>
              <span className="shrink-0 rounded-full border border-brand-orange/25 bg-surface px-2 py-0.5 text-[12px] font-medium tabular-nums text-ink">
                {formatDeliveryDateFr(item.day)}
              </span>
            </Link>
            {item.chantierSlug ? (
              <Link
                href={R.chantier(item.chantierSlug)}
                className="ml-1 text-[12px] text-muted-foreground underline-offset-2 hover:underline"
              >
                Voir le chantier
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
