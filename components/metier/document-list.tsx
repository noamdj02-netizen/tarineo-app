import Link from "next/link";
import { DocumentPreview } from "@/components/metier/document-preview";
import type { CompanyProfile } from "@/lib/metier/company";
import { KIND_LABEL, totalsFromExtract, type DocumentCard } from "@/lib/metier/types";
import { DEMO_MARK, euro } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

export function DocumentList({
  docs,
  empty,
  company,
  transformedSourceIds,
  className,
}: {
  docs: DocumentCard[];
  empty: string;
  company?: CompanyProfile | null;
  clients?: unknown;
  defaultMarginPct?: number;
  defaultClientId?: string | null;
  transformedSourceIds?: string[];
  className?: string;
}) {
  if (!docs.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-line px-6 py-12 text-center text-[14.5px] text-muted-foreground">
        {empty}
      </div>
    );
  }
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-3", className)}>
      {docs.map((d) => {
        const totals = totalsFromExtract(d.extract);
        const transformed = d.direction === "in" && Boolean(transformedSourceIds?.includes(d.id));
        const ht = totals.ht ?? d.lines.reduce((s, l) => s + Number(l.buy_price || l.sell_price) * Number(l.qty), 0);
        return (
          <li key={d.id}>
            <Link
              href={`/pieces/${d.id}`}
              className="card-soft group flex h-full flex-col overflow-hidden hover:shadow-lift"
            >
              <div className="relative bg-[#efe8e0] px-5 pt-5">
                <DocumentPreview doc={d} company={company} size="thumb" />
                <span
                  className={cn(
                    "absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-medium",
                    d.direction === "in" ? "bg-[#fff0e9] text-brand-orange" : "bg-ink text-accent-ink",
                  )}
                >
                  {KIND_LABEL[d.kind]}
                </span>
              </div>
              <div className="flex flex-col gap-1 p-4">
                <p className="text-[11px] text-muted-foreground">{d.seed_key ? DEMO_MARK : d.party_name || KIND_LABEL[d.kind]}</p>
                <p className="font-medium group-hover:underline">{d.title}</p>
                <p className="text-[13px] text-muted-foreground">
                  {d.party_name ?? "Sans destinataire"}
                  {d.chantier_name ? ` · ${d.chantier_name}` : ""}
                </p>
                <p className="mt-1 tabular-nums text-[13px] text-muted-foreground">
                  {d.lines.length} ligne{d.lines.length > 1 ? "s" : ""}
                  {ht ? ` · ${euro(ht)} HT` : ""}
                  {d.direction === "in" ? ` · ${transformed ? "déjà transformé" : "à transformer"}` : ""}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
