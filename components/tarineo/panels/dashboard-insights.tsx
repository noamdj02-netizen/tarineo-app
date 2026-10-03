"use client";

import { RecommendedActions } from "@/components/tarineo/analytics/recommended-actions";
import { TopPriceIncreases } from "@/components/tarineo/analytics/top-price-increases";
import { SalesEvolutionChart } from "@/components/tarineo/analytics/sales-evolution-chart";
import { AnnualGoals } from "@/components/tarineo/analytics/annual-goals";
import { GoalProjection } from "@/components/tarineo/analytics/goal-projection";
import { OutstandingDistribution } from "@/components/tarineo/analytics/outstanding-distribution";
import { FamilyPerformanceTable } from "@/components/tarineo/analytics/family-performance-table";
import { TopProducts } from "@/components/tarineo/products/top-products";
import { QuoteStats } from "@/components/tarineo/quotes/quote-stats";
import { QuoteStatusChart } from "@/components/tarineo/quotes/quote-status-chart";
import { TarineoPanelCard } from "@/components/tarineo/cards/tarineo-panel-card";
import { DistributorPriceTrendChart } from "@/components/tarineo/charts/distributor-price-trend-chart";
import {
  adaptAnnualGoals,
  adaptDistributorPriceTrend,
  adaptFamilyPerformance,
  adaptQuoteStats,
  adaptRecommendedActions,
  adaptSalesEvolution,
  adaptTopPriceIncreases,
  adaptTopProducts,
} from "@/lib/tarineo/adapters";
import type { DocumentCard, PriceAlert } from "@/lib/metier/types";
import type { FollowUpView } from "@/lib/metier/follow-ups";
import { R } from "@/lib/routes";

export function TarineoDashboardInsights({
  outbound,
  followUps,
  alerts,
  months,
  enseignes,
  articles,
  pendingDocs,
  devisAEnvoyer,
  relancesDue,
  distributorGoalsHt,
}: {
  outbound: DocumentCard[];
  followUps: FollowUpView[];
  alerts: PriceAlert[];
  months: { key: string; label: string; amount: number }[];
  enseignes: { label: string; amount: number }[];
  articles: { label: string; amount: number; qty: number }[];
  pendingDocs: DocumentCard[];
  devisAEnvoyer: DocumentCard[];
  relancesDue: FollowUpView[];
  distributorGoalsHt?: Record<string, number>;
}) {
  const quoteStats = adaptQuoteStats(outbound, followUps);
  const priceIncreases = adaptTopPriceIncreases(alerts);
  const sales = adaptSalesEvolution(months);
  const priceTrend = adaptDistributorPriceTrend(alerts);
  const goals = adaptAnnualGoals(enseignes, distributorGoalsHt);
  const families = adaptFamilyPerformance(articles);
  const topProducts = adaptTopProducts(articles);
  const actions = adaptRecommendedActions({
    alerts,
    pendingDocs,
    devisAEnvoyer,
    relancesDue,
  });
  const topGoal = goals[0] ?? null;

  return (
    <div className="mb-8 grid gap-6 lg:grid-cols-2">
      <TarineoPanelCard title="Mes devis clients" href={R.clientDevis}>
        <QuoteStats stats={quoteStats} />
      </TarineoPanelCard>
      <TarineoPanelCard title="Statut de vos devis" href={R.clientDevis}>
        <QuoteStatusChart stats={quoteStats} />
      </TarineoPanelCard>
      <TopPriceIncreases items={priceIncreases} />
      <div className="card-soft overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-display text-[16px] font-semibold tracking-tight text-ink">
            Évolution des prix distributeurs
          </h2>
        </div>
        <DistributorPriceTrendChart points={priceTrend} />
      </div>
      <SalesEvolutionChart points={sales} />
      <AnnualGoals distributors={goals} />
      <GoalProjection distributor={topGoal} />
      <OutstandingDistribution byFamily={families} byMonth={sales} />
      <FamilyPerformanceTable rows={families} />
      <TopProducts items={topProducts} />
      <TopPriceIncreases
        items={priceIncreases.slice(0, 5)}
        title="Produits avec la plus forte hausse"
        href={R.achatsProduits}
        compact
      />
      <div className="lg:col-span-2">
        <TarineoPanelCard title="Actions recommandées">
          <RecommendedActions actions={actions} />
        </TarineoPanelCard>
      </div>
    </div>
  );
}
