import Link from "next/link";
import { estPlanStarterPayant } from "@/lib/planGating";

type Props = {
  plan: string | null;
  subscriptionStatus: string | null;
  className?: string;
};

export function BanniereLimitesPlan({ plan, subscriptionStatus, className }: Props) {
  if (!estPlanStarterPayant(plan, subscriptionStatus)) return null;

  return (
    <div
      className={`rounded-2xl border border-[#FFE4A9] bg-[#FFF7F2] px-4 py-3 text-sm text-foreground ${className ?? ""}`}
    >
      <p className="font-medium">Plan Starter — fonctionnalités limitées</p>
      <p className="mt-1 text-muted-foreground">
        Historique de prix sur 12 mois, 3 distributeurs suivis. Les devis clients PDF (logo + SIRET) et l&apos;export
        comptable sont réservés au plan Pro.
      </p>
      <Link href="/parametres?onglet=abonnement" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
        Passer à Pro →
      </Link>
    </div>
  );
}
