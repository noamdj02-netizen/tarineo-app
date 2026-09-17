/** Plans facturables Stripe — « Équipe » = clé `equipe` (voir src/lib/quota.ts). */
export const PLANS_STRIPE = ["starter", "pro", "equipe"] as const;
export type PlanStripe = (typeof PLANS_STRIPE)[number];

export function planStripeValide(plan: string | null | undefined): PlanStripe | null {
  if (plan && PLANS_STRIPE.includes(plan as PlanStripe)) {
    return plan as PlanStripe;
  }
  return null;
}
