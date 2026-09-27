import Link from "next/link";
import { PageHead } from "@/components/shell/page-head";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { compareProduct } from "@/lib/metier/queries";
import { APP_PAGES } from "@/lib/site/app-pages";
import { euro, signedPct, variation } from "@/lib/site/tarineo";

export const metadata = { title: "Comparateur" };

export default async function ComparateurPage({
  searchParams,
}: {
  searchParams: Promise<{ article?: string }>;
}) {
  const { article } = await searchParams;
  const cmp = await compareProduct(article);
  const p = APP_PAGES.comparateur;
  const min = cmp.rows.length ? Math.min(...cmp.rows.map((r) => r.price)) : 0;
  return (
    <section className="flex flex-col gap-8">
      <PageHead mascot="06-loupe" label={p.label} title={p.title} tail={p.tail}>
        {p.text}
      </PageHead>
      {cmp.labels.length ? (
        <div className="flex flex-wrap gap-2">
          {cmp.labels.map((label) => (
            <Link
              key={label}
              href={`/audit?article=${encodeURIComponent(label)}`}
              className={
                label === cmp.label
                  ? "rounded-full bg-ink px-3 py-1.5 text-[13px] text-accent-ink"
                  : "rounded-full border border-line px-3 py-1.5 text-[13px]"
              }
            >
              {label}
            </Link>
          ))}
        </div>
      ) : null}
      <p className="font-display text-[22px] font-semibold">{cmp.label}</p>
      {cmp.rows.length ? (
        <ul className="grid gap-3">
          {cmp.rows.map((r) => {
            const yoy = r.yearAgo != null ? variation(r.yearAgo, r.price) : null;
            return (
              <li key={`${r.distributor}-${r.document}-${r.date}`} className="card-soft flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <SupplierLogo name={r.distributor} size={36} />
                  <div>
                    <p className="font-medium">{r.distributor}</p>
                    <p className="text-[13px] text-muted-foreground">
                      {r.document} · {new Date(r.date).toLocaleDateString("fr-FR")}
                    </p>
                    {yoy != null ? (
                      <p className="text-[12.5px] text-muted-foreground">vs N-1 : {signedPct(yoy)}</p>
                    ) : null}
                  </div>
                </div>
                <p className={r.price === min ? "font-semibold text-brand-orange tabular-nums" : "tabular-nums"}>
                  {euro(r.price)}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-[14.5px] text-muted-foreground">
          Déposez deux devis du même article pour comparer.{" "}
          <Link href="/ressources" className="underline underline-offset-2">
            Documents distributeur
          </Link>
        </p>
      )}
    </section>
  );
}
