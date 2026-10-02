import { TarineoSection } from "@/components/tarineo/cards/tarineo-section";
import { QuoteStats } from "@/components/tarineo/quotes/quote-stats";
import { QuoteStatusChart } from "@/components/tarineo/quotes/quote-status-chart";
import { SupplierQuote } from "@/components/tarineo/quotes/supplier-quote";
import { DevisAddProductPanel } from "@/components/tarineo/panels/devis-add-product-panel";
import {
  adaptQuoteStats,
  adaptSavedProducts,
  adaptSupplierQuoteLines,
} from "@/lib/tarineo/adapters";
import type { DocumentCard } from "@/lib/metier/types";
import type { FollowUpView } from "@/lib/metier/follow-ups";

export function DevisInsights({
  outbound,
  followUps,
  articles,
  sourceDoc,
}: {
  outbound: DocumentCard[];
  followUps: FollowUpView[];
  articles: { label: string; amount: number; qty: number }[];
  sourceDoc: DocumentCard | null;
}) {
  const stats = adaptQuoteStats(outbound, followUps);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <TarineoSection title="Statistiques devis">
        <QuoteStats stats={stats} className="p-4" />
      </TarineoSection>
      <TarineoSection title="Répartition des statuts">
        <QuoteStatusChart stats={stats} />
      </TarineoSection>
      <TarineoSection title="Lignes du dernier devis fournisseur importé" className="lg:col-span-2">
        <SupplierQuote lines={adaptSupplierQuoteLines(sourceDoc)} />
      </TarineoSection>
      <TarineoSection title="Ajouter un produit au devis client" className="lg:col-span-2">
        <DevisAddProductPanel products={adaptSavedProducts(articles)} />
      </TarineoSection>
    </div>
  );
}
