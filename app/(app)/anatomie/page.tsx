import { PageHead } from "@/components/shell/page-head";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { rankingRows } from "@/lib/metier/queries";
import { APP_PAGES } from "@/lib/site/app-pages";
import { euroInt } from "@/lib/site/tarineo";

export const metadata = { title: "Achats" };

export default async function ClassementPage() {
  const { articles, enseignes } = await rankingRows();
  const p = APP_PAGES.classement;
  const total = articles.reduce((s, r) => s + r.amount, 0);
  return (
    <section className="flex flex-col gap-8">
      <PageHead mascot="13-pancarte" label={p.label} title={p.title} tail={p.tail}>
        {p.text}
      </PageHead>
      <p className="font-display text-[32px] font-semibold tabular-nums">
        {euroInt(total)} <span className="text-[14px] font-normal text-muted-foreground">achats (HT lignes)</span>
      </p>
      {!articles.length ? (
        <p className="text-[14.5px] text-muted-foreground">Aucun achat. Déposez un devis distributeur.</p>
      ) : (
        <>
          <div>
            <p className="mono-label mb-3">{"/ Par enseigne ///"}</p>
            <ol className="divide-y divide-line rounded-[28px] border border-line bg-card">
              {enseignes.map((r, i) => (
                <li key={r.label} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-6 font-mono text-[12px] text-muted-foreground">{i + 1}</span>
                  <SupplierLogo name={r.label} size={28} />
                  <span className="flex-1">{r.label}</span>
                  <span className="tabular-nums font-medium">{euroInt(r.amount)}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="mono-label mb-3">{"/ Par article ///"}</p>
            <ol className="divide-y divide-line rounded-[28px] border border-line bg-card">
              {articles.map((r, i) => (
                <li key={r.label} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-6 font-mono text-[12px] text-muted-foreground">{i + 1}</span>
                  <span className="flex-1">{r.label}</span>
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
