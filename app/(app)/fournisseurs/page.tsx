import Link from "next/link";
import { EmptyState } from "@/components/app-ui/empty-state";
import { SectionHeader } from "@/components/app-ui/section-header";
import { AddSupplierForm } from "@/components/metier/add-supplier-form";
import { PageHead } from "@/components/shell/page-head";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { KNOWN_SUPPLIERS } from "@/lib/metier/suppliers";
import { createPartyFormAction } from "@/app/(app)/metier/actions";
import { listDocuments, listParties } from "@/lib/metier/queries";
import { R } from "@/lib/routes";
import { DEMO_MARK, euroInt } from "@/lib/site/tarineo";

export const metadata = { title: "Fournisseurs" };

export default async function FournisseursPage() {
  const [parties, docs] = await Promise.all([listParties(), listDocuments({ direction: "in" })]);
  const dists = parties.filter((x) => x.kind === "distributeur");
  const fourns = parties.filter((x) => x.kind === "fournisseur");
  const knownMissing = KNOWN_SUPPLIERS.filter(
    (k) => !parties.some((x) => x.name.toLowerCase() === k.name.toLowerCase()),
  );

  return (
    <section className="flex flex-col gap-8">
      <PageHead
        label="Fournisseurs"
        title="Fournisseurs"
        crumbs={[
          { href: "/accueil", label: "Accueil" },
          { label: "Fournisseurs" },
        ]}
      >
        Suivez vos achats et vos relations fournisseurs.
      </PageHead>
      <AddSupplierForm />
      {knownMissing.length ? (
        <div>
          <SectionHeader title="Enseignes fréquentes" />
          <ul className="grid gap-2 sm:grid-cols-2">
            {knownMissing.map((k) => (
              <li key={k.name} className="flex items-center gap-3 rounded-card border border-line bg-surface p-3 shadow-soft">
                <SupplierLogo name={k.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{k.name}</p>
                  <p className="text-[12.5px] text-muted-foreground">{k.domain}</p>
                </div>
                <form action={createPartyFormAction}>
                  <input type="hidden" name="name" value={k.name} />
                  <input type="hidden" name="kind" value={k.kind} />
                  <input type="hidden" name="website" value={k.domain} />
                  <button
                    type="submit"
                    className="rounded-[10px] border border-line px-3 py-1.5 text-[12.5px] transition-colors hover:bg-surface-2"
                  >
                    Ajouter
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {!dists.length && !fourns.length ? (
        <EmptyState
          title="Aucun fournisseur"
          text="Ajoutez une enseigne pour rattacher vos achats et documents."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <PartyCol title="Distributeurs" items={dists} docs={docs} />
          <PartyCol title="Fournisseurs (marques)" items={fourns} docs={docs} />
        </div>
      )}
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
      <SectionHeader title={title} />
      {!items.length ? (
        <p className="text-[14px] text-muted-foreground">Aucun pour l’instant.</p>
      ) : (
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
              <li key={item.id} className="flex gap-3 rounded-card border border-line bg-surface p-4 shadow-soft">
                <SupplierLogo name={item.name} size={40} />
                <div className="min-w-0 flex-1">
                  {item.seed_key ? <p className="text-[11px] text-muted-foreground">{DEMO_MARK}</p> : null}
                  <p className="font-medium">{item.name}</p>
                  <p className="text-[13px] text-muted-foreground">
                    {item.address || `${linked.length} achat${linked.length > 1 ? "s" : ""}`}
                  </p>
                  <p className="mt-1 tabular-nums text-[14px] font-medium">{euroInt(spend)}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-[13px]">
                    <Link
                      href={`${R.distributeurDevis}?party=${item.id}`}
                      className="font-medium text-tarineo-orange underline-offset-2 hover:underline"
                    >
                      Voir les pièces
                    </Link>
                    {linked[0]?.chantier_slug ? (
                      <Link
                        href={R.chantier(linked[0].chantier_slug)}
                        className="text-muted-foreground underline-offset-2 hover:underline"
                      >
                        Chantier
                      </Link>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
