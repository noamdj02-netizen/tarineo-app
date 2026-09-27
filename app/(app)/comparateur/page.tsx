import Link from "next/link";
import { PageHead } from "@/components/shell/page-head";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { compareQuotes } from "@/lib/metier/compare-quotes";
import { compareProduct, listDocuments } from "@/lib/metier/queries";
import { R } from "@/lib/routes";
import { APP_PAGES } from "@/lib/site/app-pages";
import { euro, signedPct, variation } from "@/lib/site/tarineo";

export const metadata = { title: "Comparateur" };

export default async function ComparateurPage({
  searchParams,
}: {
  searchParams: Promise<{ article?: string; a?: string; b?: string }>;
}) {
  const { article, a: idA, b: idB } = await searchParams;
  const [inbound, cmp] = await Promise.all([listDocuments({ direction: "in" }), compareProduct(article)]);
  const quotes = inbound.filter((d) => d.kind === "devis" || d.lines.length > 0);
  const docA = quotes.find((d) => d.id === idA) ?? null;
  const docB = quotes.find((d) => d.id === idB) ?? null;
  const duel = docA && docB && docA.id !== docB.id ? compareQuotes(docA, docB) : null;
  const p = APP_PAGES.comparateur;
  const min = cmp.rows.length ? Math.min(...cmp.rows.map((r) => r.price)) : 0;

  return (
    <section className="flex flex-col gap-10">
      <PageHead mascot="06-loupe" label={p.label} title="Deux devis," tail="un choix.">
        Déposez Leroy Merlin et Brico Dépôt. On aligne les lignes, le total, et les écarts à recouper.
      </PageHead>

      <form className="card-soft grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="text-[13px]">
          Devis A
          <select name="a" defaultValue={idA ?? ""} className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3">
            <option value="">Choisir</option>
            {quotes.map((d) => (
              <option key={d.id} value={d.id}>
                {(d.party_name || "Enseigne") + " · " + d.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[13px]">
          Devis B
          <select name="b" defaultValue={idB ?? ""} className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3">
            <option value="">Choisir</option>
            {quotes.map((d) => (
              <option key={d.id} value={d.id}>
                {(d.party_name || "Enseigne") + " · " + d.title}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn-dark h-11 rounded-xl px-4 text-[13px]">
          Comparer
        </button>
      </form>

      {duel && docA && docB ? (
        <div className="flex flex-col gap-4">
          <div className="card-soft p-5">
            <p className="mono-label mb-2">{"/ Verdict ///"}</p>
            <p className="text-[16px] leading-relaxed">{duel.note}</p>
            <p className="mt-3 tabular-nums text-[14px] text-muted-foreground">
              {duel.nameA} {euro(duel.totalA)} HT · {duel.nameB} {euro(duel.totalB)} HT
            </p>
          </div>
          <ul className="divide-y divide-line rounded-[28px] border border-line bg-card">
            {duel.rows.map((r) => (
              <li key={`${r.label}-${r.priceA}-${r.priceB}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <p className="min-w-0 font-medium">{r.label}</p>
                <p className="tabular-nums text-[13.5px]">
                  <span className={r.priceA != null && r.priceB != null && r.priceA < r.priceB ? "text-brand-orange" : ""}>
                    {r.priceA != null ? euro(r.priceA) : "—"}
                  </span>
                  {" / "}
                  <span className={r.priceA != null && r.priceB != null && r.priceB < r.priceA ? "text-brand-orange" : ""}>
                    {r.priceB != null ? euro(r.priceB) : "—"}
                  </span>
                  {r.flag === "ecart" ? (
                    <span className="ml-2 text-[12px] text-muted-foreground">écart</span>
                  ) : r.flag === "seul" ? (
                    <span className="ml-2 text-[12px] text-muted-foreground">d’un côté</span>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : quotes.length < 2 ? (
        <p className="text-[14.5px] text-muted-foreground">
          Il faut deux devis d’achat.{" "}
          <Link href={R.distributeurDevis} className="underline underline-offset-2">
            Déposez-les
          </Link>
          .
        </p>
      ) : null}

      <div>
        <p className="mono-label mb-3">{"/ Même article ///"}</p>
        {cmp.labels.length ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {cmp.labels.map((label) => (
              <Link
                key={label}
                href={`${R.comparateur}?article=${encodeURIComponent(label)}${idA ? `&a=${idA}` : ""}${idB ? `&b=${idB}` : ""}`}
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
          <p className="text-[14.5px] text-muted-foreground">Pas encore assez de lignes pour un article.</p>
        )}
      </div>
    </section>
  );
}
