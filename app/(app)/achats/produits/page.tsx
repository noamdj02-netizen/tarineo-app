import Link from "next/link";
import { EmptyState } from "@/components/app-ui/empty-state";
import { SectionHeader } from "@/components/app-ui/section-header";
import { PageHead } from "@/components/shell/page-head";
import { TarineoPanelCard } from "@/components/tarineo/cards/tarineo-panel-card";
import { TopPriceIncreases } from "@/components/tarineo/analytics/top-price-increases";
import { AchatsProductList } from "@/components/tarineo/products/achats-product-list";
import { TopProducts } from "@/components/tarineo/products/top-products";
import {
  adaptSavedProducts,
  adaptTopPriceIncreases,
} from "@/lib/tarineo/adapters";
import { listAlerts, rankingRows } from "@/lib/metier/queries";
import { R } from "@/lib/routes";

export const metadata = { title: "Produits — Achats" };

export default async function AchatsProduitsPage() {
  const [{ articles }, alerts] = await Promise.all([rankingRows(), listAlerts()]);
  const products = adaptSavedProducts(articles);
  const topBySpend = articles.slice(0, 8).map((a, i) => ({
    id: `top-${i}`,
    name: a.label,
    amountHt: a.amount,
    qty: a.qty,
  }));

  return (
    <section className="flex flex-col gap-8 pb-10">
      <PageHead
        label="Achats"
        title="Produits"
        crumbs={[
          { href: "/accueil", label: "Accueil" },
          { href: R.achats, label: "Achats" },
          { label: "Produits" },
        ]}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href={R.achatsExport}
              className="inline-flex h-9 items-center rounded-[10px] border border-line bg-surface px-4 text-[13.5px] font-medium text-ink hover:bg-surface-2"
            >
              Export comptable
            </Link>
            <Link
              href={`${R.distributeurDevis}#import`}
              className="btn-orange inline-flex h-9 items-center px-4 text-[13.5px] font-medium"
            >
              Importer un document
            </Link>
          </div>
        }
      >
        Fiches articles, historique de prix et hausses détectées sur vos achats distributeur.
      </PageHead>

      {!articles.length ? (
        <EmptyState
          title="Aucun produit"
          text="Importez une facture ou un devis fournisseur pour constituer votre catalogue d’achats."
          actionHref={`${R.distributeurDevis}#import`}
          actionLabel="Importer un document"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <TarineoPanelCard title="Produits enregistrés">
            <AchatsProductList products={products} />
          </TarineoPanelCard>
          <TopProducts items={topBySpend} title="Top produits vendus" />
          <div className="lg:col-span-2">
            <TopPriceIncreases items={adaptTopPriceIncreases(alerts, 8)} title="Principales hausses détectées" />
          </div>
        </div>
      )}
    </section>
  );
}
