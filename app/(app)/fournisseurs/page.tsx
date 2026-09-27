import Link from "next/link";
import { AddSupplierForm } from "@/components/metier/add-supplier-form";
import { PageHead } from "@/components/shell/page-head";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { KNOWN_SUPPLIERS } from "@/lib/metier/suppliers";
import { createPartyFormAction } from "@/app/(app)/metier/actions";
import { listDocuments, listParties } from "@/lib/metier/queries";
import { R } from "@/lib/routes";
import { APP_PAGES } from "@/lib/site/app-pages";
import { DEMO_MARK, euroInt } from "@/lib/site/tarineo";

export const metadata = { title: "Fournisseurs" };

export default async function FournisseursPage() {
  const [parties, docs] = await Promise.all([listParties(), listDocuments({ direction: "in" })]);
  const p = APP_PAGES.fournisseurs;
  const dists = parties.filter((x) => x.kind === "distributeur");
  const fourns = parties.filter((x) => x.kind === "fournisseur");
  const knownMissing = KNOWN_SUPPLIERS.filter((k) => !parties.some((x) => x.name.toLowerCase() === k.name.toLowerCase()));

  return (
    <section className="flex flex-col gap-8">
      <PageHead mascot="10-chrono" label={p.label} title={p.title} tail={p.tail}>
        {p.text}
      </PageHead>
      <AddSupplierForm />
      {knownMissing.length ? (
        <div>
          <p className="mono-label mb-3">{"/ Enseignes fréquentes ///"}</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {knownMissing.map((k) => (
              <li key={k.name} className="card-soft flex items-center gap-3 p-3">
                <SupplierLogo name={k.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{k.name}</p>
                  <p className="text-[12.5px] text-muted-foreground">{k.domain}</p>
                </div>
                <form action={createPartyFormAction}>
                  <input type="hidden" name="name" value={k.name} />
                  <input type="hidden" name="kind" value={k.kind} />
                  <input type="hidden" name="website" value={k.domain} />
                  <button type="submit" className="rounded-full border border-line px-3 py-1.5 text-[12.5px]">
                    Ajouter
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-2">
        <PartyCol title="Distributeurs" items={dists} docs={docs} />
        <PartyCol title="Fournisseurs (marques)" items={fourns} docs={docs} />
      </div>
    </section>
  );
}

function PartyCol({
  title,
  items,
  docs,
}: {
  title: string;
  items: { id: string; name: string; address: string; seed_key: string | null }[];
  docs: Awaited<ReturnType<typeof listDocuments>>;
}) {
  return (
    <div>
      <p className="mono-label mb-3">{`/ ${title} ///`}</p>
      <ul className="grid gap-3">
        {items.map((item) => {
          const linked = docs.filter(
            (d) =>
              d.party_id === item.id ||
              d.lines.some((l) => l.supplier_party_id === item.id || l.distributor_party_id === item.id),
          );
          const spend = linked.reduce(
            (s, d) => s + d.lines.reduce((a, l) => a + Number(l.buy_price) * Number(l.qty), 0),
            0,
          );
          return (
            <li key={item.id} className="card-soft flex gap-3 p-4">
              <SupplierLogo name={item.name} size={40} />
              <div className="min-w-0 flex-1">
                {item.seed_key ? <p className="text-[11px] text-muted-foreground">{DEMO_MARK}</p> : null}
                <p className="font-medium">{item.name}</p>
                <p className="text-[13px] text-muted-foreground">{item.address || `${linked.length} document${linked.length > 1 ? "s" : ""}`}</p>
                <p className="mt-1 tabular-nums text-[14px]">{euroInt(spend)}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-[13px]">
                  <Link href={`${R.distributeurDevis}?party=${item.id}`} className="underline underline-offset-2">
                    Voir les pièces
                  </Link>
                  {linked[0]?.chantier_slug ? (
                    <Link href={R.chantier(linked[0].chantier_slug)} className="underline underline-offset-2">
                      Chantier
                    </Link>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
