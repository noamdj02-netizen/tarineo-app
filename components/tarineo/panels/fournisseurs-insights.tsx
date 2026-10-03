import { TarineoPanelCard } from "@/components/tarineo/cards/tarineo-panel-card";
import { DistributorPriceTrendChart } from "@/components/tarineo/charts/distributor-price-trend-chart";
import { SavedProducts } from "@/components/tarineo/products/saved-products";
import { TopPriceIncreases } from "@/components/tarineo/analytics/top-price-increases";
import { DistributorSummary } from "@/components/tarineo/suppliers/distributor-summary";
import { ProductDetail } from "@/components/tarineo/products/product-detail";
import { AnnualGoals } from "@/components/tarineo/analytics/annual-goals";
import {
  adaptAnnualGoals,
  adaptDistributorPriceTrend,
  adaptPriceHistoryFromAlerts,
  adaptSavedProducts,
  adaptTopPriceIncreases,
} from "@/lib/tarineo/adapters";
import type { DocumentCard, PriceAlert } from "@/lib/metier/types";
import { R } from "@/lib/routes";

export function FournisseursInsights({
  articles,
  enseignes,
  alerts,
  sampleDoc,
  distributorGoalsHt,
}: {
  articles: { label: string; amount: number; qty: number }[];
  enseignes: { label: string; amount: number }[];
  alerts: PriceAlert[];
  sampleDoc: DocumentCard | null;
  distributorGoalsHt?: Record<string, number>;
}) {
  const distributors = adaptAnnualGoals(enseignes, distributorGoalsHt);
  const top = distributors[0] ?? null;
  const featured = articles[0];
  const product = featured
    ? {
        id: "featured",
        name: featured.label,
        supplierRef: null,
        distributorRef: null,
        lastPriceHt: featured.qty > 0 ? featured.amount / featured.qty : null,
      }
    : null;
  const priceTrend = adaptDistributorPriceTrend(alerts);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <TarineoPanelCard title={top ? top.name : "Distributeur"}>
        {top ? <DistributorSummary distributor={top} /> : <p className="px-5 py-6 text-[13px] text-muted-foreground">—</p>}
      </TarineoPanelCard>
      <div className="card-soft overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-display text-[16px] font-semibold tracking-tight text-ink">Évolution des prix</h2>
        </div>
        <DistributorPriceTrendChart points={priceTrend} />
      </div>
      <AnnualGoals distributors={distributors} />
      <TarineoPanelCard title="Produits enregistrés" href={R.achatsProduits}>
        <SavedProducts products={adaptSavedProducts(articles)} />
      </TarineoPanelCard>
      <TopPriceIncreases items={adaptTopPriceIncreases(alerts, 5)} title="Produits avec la plus forte hausse" href={R.hausses} compact />
      {product ? (
        <TarineoPanelCard title="Fiche produit" className="lg:col-span-2">
          <ProductDetail
            product={product}
            priceHistory={adaptPriceHistoryFromAlerts(alerts, product.name)}
            documentsHref={sampleDoc ? `/pieces/${sampleDoc.id}` : undefined}
          />
        </TarineoPanelCard>
      ) : null}
    </div>
  );
}
