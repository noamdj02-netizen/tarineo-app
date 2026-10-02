import Link from "next/link";
import { EmptyState } from "@/components/app-ui/empty-state";
import { TarineoSection } from "@/components/tarineo/cards/tarineo-section";
import { PriceIncreaseList } from "@/components/tarineo/analytics/price-increase-list";
import { StatusBadge } from "@/components/tarineo/status-badge";
import { adaptTopPriceIncreases } from "@/lib/tarineo/adapters";
import { PageHead } from "@/components/shell/page-head";
import { DEMO_IDS } from "@/lib/metier/demo";
import { listAlerts } from "@/lib/metier/queries";
import { R } from "@/lib/routes";
import { DEMO_MARK, euro, signedPct, variation } from "@/lib/site/tarineo";

export const metadata = { title: "Hausses de prix" };

export default async function AlertesPage() {
  const alerts = await listAlerts();
  return (
    <section className="flex flex-col gap-8">
      <PageHead
        label="Hausses"
        title="Hausses de prix"
        crumbs={[
          { href: "/accueil", label: "Accueil" },
          { label: "Hausses" },
        ]}
      >
        Identifiez les augmentations qui peuvent réduire votre marge.
      </PageHead>
      <TarineoSection title="Principales hausses">
        <PriceIncreaseList items={adaptTopPriceIncreases(alerts)} />
      </TarineoSection>

      {alerts.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {alerts.map((a) => {
            const pct = variation(Number(a.old_price), Number(a.new_price));
            const demo = a.id === DEMO_IDS.alert;
            return (
              <li key={a.id} className="rounded-card border border-line bg-surface p-5 shadow-soft">
                {demo ? <p className="mb-1 text-[11px] text-muted-foreground">{DEMO_MARK}</p> : null}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-[16px] font-semibold tracking-[-0.02em]">{a.label}</p>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      {a.chantier_name ?? "Tous chantiers"}
                    </p>
                  </div>
                  <StatusBadge label={signedPct(pct)} tone="warn" />
                </div>
                <p className="mt-4 font-display text-[20px] font-semibold tabular-nums tracking-[-0.02em]">
                  {euro(Number(a.old_price))}
                  <span className="mx-2 text-[14px] font-normal text-muted-foreground">→</span>
                  {euro(Number(a.new_price))}
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-[13px]">
                  {a.document_id ? (
                    <Link href={R.piece(a.document_id)} className="font-medium text-tarineo-orange hover:underline">
                      Voir la pièce
                    </Link>
                  ) : null}
                  <Link
                    href={`${R.comparateur}?article=${encodeURIComponent(a.label)}`}
                    className="text-muted-foreground hover:underline"
                  >
                    Comparer
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          title="Aucune hausse détectée"
          text="Importez des devis fournisseurs pour comparer les prix dans le temps."
          actionHref={R.distributeurDevis}
          actionLabel="Importer un devis"
        />
      )}
    </section>
  );
}
