import Link from "next/link";
import { EmptyState } from "@/components/app-ui/empty-state";
import { PageHead } from "@/components/shell/page-head";
import { SectionHeader } from "@/components/app-ui/section-header";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { YearSpendWidget } from "@/components/home/spend-widgets";
import { listDocuments, rankingRows, spendByMonth } from "@/lib/metier/queries";
import { R } from "@/lib/routes";
import { euroInt } from "@/lib/site/tarineo";

export const metadata = { title: "Achats" };

export default async function ClassementPage() {
  const [{ articles, enseignes }, inbound] = await Promise.all([
    rankingRows(),
    listDocuments({ direction: "in" }),
  ]);
  const total = articles.reduce((s, r) => s + r.amount, 0);
  return (
    <section className="flex flex-col gap-8">
      <PageHead
        label="Achats"
        title="Achats"
        crumbs={[
          { href: "/accueil", label: "Accueil" },
          { label: "Achats" },
        ]}
        action={
          <Link
            href={`${R.distributeurDevis}#import`}
            className="btn-orange inline-flex h-9 items-center px-4 text-[13.5px] font-medium"
          >
            Importer un document
          </Link>
        }
      >
        Suivez vos achats par fournisseur et par article.
      </PageHead>
      <p className="font-display text-[32px] font-semibold tabular-nums tracking-[-0.03em]">
        {euroInt(total)}{" "}
        <span className="text-[14px] font-normal text-muted-foreground">HT lignes</span>
      </p>
      <YearSpendWidget months={spendByMonth(inbound)} />
      {!articles.length ? (
        <EmptyState
          title="Aucun achat"
          text="Importez un devis distributeur pour voir vos volumes par enseigne et par article."
          actionHref={`${R.distributeurDevis}#import`}
          actionLabel="Importer un document"
        />
      ) : (
        <>
          <div>
            <SectionHeader title="Par enseigne" />
            <ol className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-soft">
              {enseignes.map((r, i) => (
                <li key={r.label} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="w-6 font-mono text-[12px] text-muted-foreground">{i + 1}</span>
                  <SupplierLogo name={r.label} size={28} />
                  <span className="flex-1 text-[14px]">{r.label}</span>
                  <span className="tabular-nums font-medium">{euroInt(r.amount)}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <SectionHeader title="Par article" />
            <ol className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-soft">
              {articles.map((r, i) => (
                <li key={r.label} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="w-6 font-mono text-[12px] text-muted-foreground">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-[14px]">{r.label}</span>
                  <span className="text-[13px] text-muted-foreground">{r.qty}</span>
                  <span className="tabular-nums font-medium">{euroInt(r.amount)}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </section>
  );
}
