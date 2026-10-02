import { TarineoSection } from "@/components/tarineo/cards/tarineo-section";
import { SavedProducts } from "@/components/tarineo/products/saved-products";
import { TopPriceIncreases } from "@/components/tarineo/analytics/top-price-increases";
import { DistributorPriceChart } from "@/components/tarineo/charts/distributor-price-chart";
import { DistributorSummary } from "@/components/tarineo/suppliers/distributor-summary";
import { ProductDetail } from "@/components/tarineo/products/product-detail";
import {
  adaptAnnualGoals,
  adaptPriceHistoryFromAlerts,
  adaptSavedProducts,
  adaptTopPriceIncreases,
} from "@/lib/tarineo/adapters";
import type { DocumentCard, PriceAlert } from "@/lib/metier/types";

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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <TarineoSection title="Résumé distributeur principal">
        {top ? <DistributorSummary distributor={top} /> : <p className="p-4 text-[13px] text-muted-foreground">—</p>}
      </TarineoSection>
      <TarineoSection title="Évolution par distributeur">
        <DistributorPriceChart distributors={enseignes.slice(0, 6).map((e) => ({ name: e.label, total: e.amount }))} />
      </TarineoSection>
      <TarineoSection title="Produits enregistrés">
        <SavedProducts products={adaptSavedProducts(articles)} />
      </TarineoSection>
      <TarineoSection title="Hausses détectées">
        <TopPriceIncreases items={adaptTopPriceIncreases(alerts, 5)} />
      </TarineoSection>
      {product ? (
        <TarineoSection title="Fiche produit" className="lg:col-span-2">
          <ProductDetail
            product={product}
            priceHistory={adaptPriceHistoryFromAlerts(alerts, product.name)}
            documentsHref={sampleDoc ? `/pieces/${sampleDoc.id}` : undefined}
          />
        </TarineoSection>
      ) : null}
    </div>
  );
}
