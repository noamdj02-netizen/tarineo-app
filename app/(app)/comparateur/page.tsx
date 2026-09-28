import Link from "next/link";
import { EmptyState } from "@/components/app-ui/empty-state";
import { SectionHeader } from "@/components/app-ui/section-header";
import { PageHead } from "@/components/shell/page-head";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { compareQuotes } from "@/lib/metier/compare-quotes";
import { compareProduct, listDocuments } from "@/lib/metier/queries";
import { R } from "@/lib/routes";
import { euro, signedPct, variation } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

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
  const min = cmp.rows.length ? Math.min(...cmp.rows.map((r) => r.price)) : 0;

  return (
    <section className="flex flex-col gap-8">
      <PageHead
        label="Comparateur"
        title="Comparateur"
        crumbs={[
          { href: "/accueil", label: "Accueil" },
          { label: "Comparateur" },
        ]}
      >
        Comparez deux devis fournisseurs ligne par ligne.
      </PageHead>

      <form className="grid gap-3 rounded-card border border-line bg-surface p-5 shadow-soft sm:grid-cols-[1fr_auto_1fr_auto] sm:items-end">
        <label className="text-[13px] text-muted-foreground">
          Document A
          <select
            name="a"
            defaultValue={idA ?? ""}
            className="mt-1.5 h-11 w-full rounded-[10px] border border-line bg-bg px-3 text-[14px] text-ink"
          >
            <option value="">Choisir</option>
            {quotes.map((d) => (
              <option key={d.id} value={d.id}>
                {(d.party_name || "Enseigne") + " · " + d.title}
              </option>
            ))}
          </select>
        </label>
        <p className="hidden pb-3 text-center text-[13px] font-medium text-muted-foreground sm:block">vs</p>
        <label className="text-[13px] text-muted-foreground">
          Document B
          <select
            name="b"
            defaultValue={idB ?? ""}
            className="mt-1.5 h-11 w-full rounded-[10px] border border-line bg-bg px-3 text-[14px] text-ink"
          >
            <option value="">Choisir</option>
            {quotes.map((d) => (
              <option key={d.id} value={d.id}>
                {(d.party_name || "Enseigne") + " · " + d.title}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn-orange h-11 rounded-[10px] px-5 text-[13.5px] font-medium">
          Comparer
        </button>
      </form>

      {duel && docA && docB ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-card border border-line bg-surface p-5 shadow-soft">
            <SectionHeader title="Résultat" className="mb-2" />
            <p className="text-[15px] leading-relaxed text-ink">{duel.note}</p>
            <p className="mt-3 tabular-nums text-[13px] text-muted-foreground">
              {duel.nameA} {euro(duel.totalA)} HT · {duel.nameB} {euro(duel.totalB)} HT
            </p>
          </div>
          <div className="overflow-hidden rounded-card border border-line bg-surface shadow-soft">
            <div className="grid grid-cols-[minmax(0,1.4fr)_1fr_1fr_auto] gap-2 border-b border-line bg-surface-2/60 px-4 py-2.5 text-[11px] font-medium tracking-[0.04em] text-muted-foreground uppercase">
              <span>Produit</span>
              <span className="text-right">Prix A</span>
              <span className="text-right">Prix B</span>
              <span className="text-right">Écart</span>
            </div>
            <ul className="divide-y divide-line">
              {duel.rows.map((r) => {
                const delta =
                  r.priceA != null && r.priceB != null ? r.priceB - r.priceA : null;
                const highlight = r.flag === "ecart";
                return (
                  <li
                    key={`${r.label}-${r.priceA}-${r.priceB}`}
                    className={cn(
                      "grid grid-cols-[minmax(0,1.4fr)_1fr_1fr_auto] items-center gap-2 px-4 py-3 text-[13.5px]",
                      highlight && "bg-tarineo-orange-hover",
                    )}
                  >
                    <p className="min-w-0 truncate font-medium">{r.label}</p>
                    <p
                      className={cn(
                        "text-right tabular-nums",
                        r.priceA != null && r.priceB != null && r.priceA < r.priceB && "font-semibold text-tarineo-orange",
                      )}
                    >
                      {r.priceA != null ? euro(r.priceA) : "—"}
                    </p>
                    <p
                      className={cn(
                        "text-right tabular-nums",
                        r.priceA != null && r.priceB != null && r.priceB < r.priceA && "font-semibold text-tarineo-orange",
                      )}
                    >
                      {r.priceB != null ? euro(r.priceB) : "—"}
                    </p>
                    <p className="min-w-[4.5rem] text-right text-[12px] text-muted-foreground">
                      {delta != null
                        ? signedPct(variation(r.priceA!, r.priceB!))
                        : r.flag === "seul"
                          ? "d’un côté"
                          : "—"}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : quotes.length < 2 ? (
        <EmptyState
          title="Deux documents nécessaires"
          text="Importez au moins deux devis d’achat pour lancer une comparaison."
          actionHref={R.distributeurDevis}
          actionLabel="Importer un devis"
        />
      ) : null}

      <div>
        <SectionHeader title="Même article" />
        {cmp.labels.length ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {cmp.labels.map((label) => (
              <Link
                key={label}
                href={`${R.comparateur}?article=${encodeURIComponent(label)}${idA ? `&a=${idA}` : ""}${idB ? `&b=${idB}` : ""}`}
                className={
                  label === cmp.label
                    ? "rounded-[10px] bg-ink px-3 py-1.5 text-[13px] text-accent-ink"
                    : "rounded-[10px] border border-line bg-surface px-3 py-1.5 text-[13px] hover:bg-surface-2"
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
                <li
                  key={`${r.distributor}-${r.document}-${r.date}`}
                  className="flex items-center justify-between gap-3 rounded-card border border-line bg-surface p-4 shadow-soft"
                >
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
                  <p
                    className={
                      r.price === min
                        ? "font-semibold text-tarineo-orange tabular-nums"
                        : "tabular-nums"
                    }
                  >
                    {euro(r.price)}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-[14px] text-muted-foreground">Pas encore assez de lignes pour un article.</p>
        )}
      </div>
    </section>
  );
}
