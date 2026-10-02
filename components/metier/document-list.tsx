import { EmptyState } from "@/components/app-ui/empty-state";
import Link from "next/link";
import { ConvertDevisActions } from "@/components/metier/convert-devis";
import { DocumentPreview } from "@/components/metier/document-preview";
import type { CompanyProfile } from "@/lib/metier/company";
import { KIND_LABEL, totalsFromExtract, type DocumentCard } from "@/lib/metier/types";
import { DEMO_MARK, euro } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

export function DocumentList({
  docs,
  empty,
  emptyHref,
  emptyAction,
  company,
  transformedSourceIds,
  className,
}: {
  docs: DocumentCard[];
  empty: string;
  emptyHref?: string;
  emptyAction?: string;
  company?: CompanyProfile | null;
  clients?: unknown;
  defaultMarginPct?: number;
  defaultClientId?: string | null;
  transformedSourceIds?: string[];
  className?: string;
}) {
  if (!docs.length) {
    return (
      <EmptyState
        title="Aucun document"
        text={empty}
        actionHref={emptyHref}
        actionLabel={emptyAction}
      />
    );
  }
  return (
    <ul className={cn("grid gap-2 md:grid-cols-2 md:gap-3 xl:grid-cols-3", className)}>
      {docs.map((d) => {
        const totals = totalsFromExtract(d.extract);
        const transformed = d.direction === "in" && Boolean(transformedSourceIds?.includes(d.id));
        const ht = totals.ht ?? d.lines.reduce((s, l) => s + Number(l.buy_price || l.sell_price) * Number(l.qty), 0);
        return (
          <li
            key={d.id}
            className={cn(
              "card-soft flex h-full flex-col overflow-hidden transition-[border-color,background-color] duration-150 hover:border-[rgba(255,107,26,0.16)]",
              d.direction === "in" ? "bg-wash-orange-strong" : "bg-surface",
            )}
          >
            <Link href={`/pieces/${d.id}`} className="group flex min-h-11 flex-1 flex-col md:min-h-0">
              <div className="relative bg-wash-paper px-3 py-3">
                <div className="mx-auto w-[min(100%,176px)] overflow-hidden rounded-[6px] shadow-sm">
                  <DocumentPreview doc={d} company={company} size="thumb" />
                </div>
                <span
                  className={cn(
                    "absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-medium",
                    "bg-wash-badge text-wash-badge-ink",
                  )}
                >
                  {KIND_LABEL[d.kind]}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-4 md:p-4">
                <p className="text-[11px] font-medium tracking-[0.04em] text-muted-foreground uppercase">
                  {KIND_LABEL[d.kind]}
                  {d.party_name ? ` · ${d.party_name}` : d.seed_key ? ` · ${DEMO_MARK}` : ""}
                </p>
                <p className="font-medium group-hover:underline">{d.title}</p>
                <p className="text-[13px] text-muted-foreground">
                  {d.chantier_name ?? "Sans chantier"}
                </p>
                <p className="mt-1 tabular-nums text-[15px] font-medium">
                  {ht ? `${euro(ht)} HT` : "—"}
                </p>
                <p className="tabular-nums text-[13px] text-muted-foreground">
                  {d.lines.length} ligne{d.lines.length > 1 ? "s" : ""}
                  {d.direction === "in" ? ` · ${transformed ? "déjà transformé" : "à transformer"}` : ""}
                </p>
              </div>
            </Link>
            {d.direction === "out" && (d.kind === "devis" || d.kind === "bon_commande") ? (
              <div className="border-t border-line px-4 py-3">
                <ConvertDevisActions sourceId={d.id} sourceKind={d.kind} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
