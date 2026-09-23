"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { changerPlanAbonnement } from "../documents/stripeActions";
import type { PlanStripe } from "@/lib/plansStripe";
import { cn } from "@/lib/utils";

export function BoutonPasserAuPlan({
  plan,
  label,
  abonnementActif,
  className,
}: {
  plan: PlanStripe;
  label: string;
  abonnementActif: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);

  async function action() {
    setErreur(null);
    setSucces(false);

    if (abonnementActif) {
      setEnCours(true);
      const resultat = await changerPlanAbonnement(plan);
      setEnCours(false);

      if (resultat.succes) {
        setSucces(true);
        router.refresh();
        return;
      }
      if (resultat.besoinPaiement) {
        router.push(`/parametres?onglet=abonnement&plan=${plan}&paiement=1#paiement-stripe`);
        return;
      }
      setErreur(resultat.erreur);
      return;
    }

    router.push(`/parametres?onglet=abonnement&plan=${plan}&paiement=1#paiement-stripe`);
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={action}
        disabled={enCours}
        className={cn(
          "inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-white hover:opacity-95 disabled:opacity-60",
          className,
        )}
      >
        {enCours ? "Mise à jour…" : succes ? "Plan mis à jour ✓" : label}
      </button>
      {erreur && <p className="mt-2 text-center text-xs text-red-600">{erreur}</p>}
    </div>
  );
}
