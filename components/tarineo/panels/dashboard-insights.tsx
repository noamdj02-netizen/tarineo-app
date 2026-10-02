"use client";

import { TarineoSection } from "@/components/tarineo/cards/tarineo-section";
import { RecommendedActions } from "@/components/tarineo/analytics/recommended-actions";
import { TopPriceIncreases } from "@/components/tarineo/analytics/top-price-increases";
import { SalesEvolutionChart } from "@/components/tarineo/analytics/sales-evolution-chart";
import { AnnualGoals } from "@/components/tarineo/analytics/annual-goals";
import { GoalProjection } from "@/components/tarineo/analytics/goal-projection";
import { OutstandingDistribution } from "@/components/tarineo/analytics/outstanding-distribution";
import { FamilyPerformanceTable } from "@/components/tarineo/analytics/family-performance-table";
import { TopProducts } from "@/components/tarineo/products/top-products";
import { QuoteStats } from "@/components/tarineo/quotes/quote-stats";
import {
  adaptAnnualGoals,
  adaptFamilyPerformance,
  adaptQuoteStats,
  adaptRecommendedActions,
  adaptSalesEvolution,
  adaptTopPriceIncreases,
  adaptTopProducts,
} from "@/lib/tarineo/adapters";
import type { DocumentCard, PriceAlert } from "@/lib/metier/types";
import type { FollowUpView } from "@/lib/metier/follow-ups";

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
      <TarineoSection title="Devis" description="Suivi des devis clients">
        <QuoteStats stats={quoteStats} className="p-4" />
      </TarineoSection>
      <TarineoSection title="Hausses à surveiller">
        <TopPriceIncreases items={priceIncreases} />
      </TarineoSection>
      <TarineoSection title="Évolution des achats">
        <SalesEvolutionChart points={sales} />
      </TarineoSection>
      <TarineoSection title="Objectifs distributeurs" description="Basé sur vos achats enregistrés">
        <AnnualGoals distributors={goals} />
      </TarineoSection>
      <TarineoSection title="Projection objectif">
        <GoalProjection distributor={topGoal} />
      </TarineoSection>
      <TarineoSection title="Encours">
        <OutstandingDistribution byFamily={families} byMonth={sales} />
      </TarineoSection>
      <TarineoSection title="Performance par article">
        <FamilyPerformanceTable rows={families} />
      </TarineoSection>
      <TarineoSection title="Produits les plus achetés">
        <TopProducts items={topProducts} />
      </TarineoSection>
      <TarineoSection title="Actions recommandées" className="lg:col-span-2">
        <RecommendedActions actions={actions} />
      </TarineoSection>
    </div>
  );
}
