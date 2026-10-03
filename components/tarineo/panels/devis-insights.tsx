import { TarineoPanelCard } from "@/components/tarineo/cards/tarineo-panel-card";
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
import { R } from "@/lib/routes";

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
      <TarineoPanelCard title="Mes devis clients" href={R.clientDevis}>
        <QuoteStats stats={stats} />
      </TarineoPanelCard>
      <TarineoPanelCard title="Statut de vos devis" href={R.clientDevis}>
        <QuoteStatusChart stats={stats} />
      </TarineoPanelCard>
      <TarineoPanelCard title="Devis distributeur" className="lg:col-span-2">
        <SupplierQuote lines={adaptSupplierQuoteLines(sourceDoc)} />
      </TarineoPanelCard>
      <TarineoPanelCard title="Ajouter un produit" className="lg:col-span-2">
        <DevisAddProductPanel products={adaptSavedProducts(articles)} />
      </TarineoPanelCard>
    </div>
  );
}
