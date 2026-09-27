import Link from "next/link";
import { DocumentDownload } from "@/components/metier/document-download";
import { DocumentSend } from "@/components/metier/document-send";
import { ExtractTotalsFromDoc } from "@/components/metier/extract-totals";
import { TransformForm } from "@/components/metier/transform-form";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { KIND_LABEL, totalsFromExtract, type DocumentCard, type Party } from "@/lib/metier/types";
import { DEMO_MARK, euro } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

export function DocumentList({
  docs,
  empty,
  clients,
  defaultMarginPct,
  defaultClientId,
  transformedSourceIds,
}: {
  docs: DocumentCard[];
  empty: string;
  clients?: Party[];
  defaultMarginPct?: number;
  defaultClientId?: string | null;
  transformedSourceIds?: string[];
}) {
  if (!docs.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-line px-6 py-12 text-center text-[14.5px] text-muted-foreground">
        {empty}
      </div>
    );
  }
  return (
    <ul className="grid gap-3">
      {docs.map((d) => {
        const totals = totalsFromExtract(d.extract);
        const transformed = d.direction === "in" && Boolean(transformedSourceIds?.includes(d.id));
        return (
        <li key={d.id} className="card-soft flex flex-col gap-3 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              {d.party_name ? <SupplierLogo name={d.party_name} size={36} /> : null}
              <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">{d.seed_key ? DEMO_MARK : KIND_LABEL[d.kind]}</p>
              <p className="font-medium">{d.title}</p>
              <p className="text-[13px] text-muted-foreground">
                {d.direction === "in" ? "Achat" : "Client"}
                {d.party_name ? ` · ${d.party_name}` : ""}
                {d.chantier_name ? ` · ${d.chantier_name}` : ""}
              </p>
              {d.direction === "in" ? (
                <p className="mt-1 text-[12px] text-muted-foreground">{transformed ? "Déjà transformé" : "À transformer"}</p>
              ) : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[12px]",
                  d.direction === "in" ? "bg-[#fff0e9] text-brand-orange" : "bg-ink text-accent-ink",
                )}
              >
                {KIND_LABEL[d.kind]}
              </span>
              {d.direction === "out" ? <DocumentDownload doc={d} /> : null}
              {d.chantier_slug ? (
                <Link href={`/projets/${d.chantier_slug}`} className="text-[13px] underline underline-offset-2">
                  Chantier
                </Link>
              ) : null}
              {d.lines[0] ? (
                <span className="tabular-nums text-[13px] text-muted-foreground">
                  {d.lines.length} ligne{d.lines.length > 1 ? "s" : ""}
                  {totals.ht != null ? ` · ${euro(totals.ht)} HT` : ` · ${euro(d.lines[0].buy_price)}`}
                </span>
              ) : null}
            </div>
          </div>
          <ExtractTotalsFromDoc extract={d.extract} />
          {d.direction === "out" ? <DocumentSend doc={d} /> : null}
          {clients && d.direction === "in" ? (
            <TransformForm
              source={d}
              clients={clients}
              defaultClientId={
                defaultClientId ?? (d.party_kind === "client" ? d.party_id : clients[0]?.id ?? null)
              }
              defaultMarginPct={defaultMarginPct}
            />
          ) : null}
        </li>
        );
      })}
    </ul>
  );
}
