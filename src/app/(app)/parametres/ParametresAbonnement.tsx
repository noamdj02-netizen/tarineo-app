import Link from "next/link";
import { PLANS_TARINEO } from "@/lib/plansTarineo";
import { Badge } from "@/components/ui/badge";
import { BoutonPortailStripe } from "./BoutonPortailStripe";

type Props = {
  planActuel: string | null;
  abonnementActif: boolean;
  aCompteStripe: boolean;
  planSelectionne: string | null;
};

export function ParametresAbonnement({ planActuel, abonnementActif, aCompteStripe, planSelectionne }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Choisissez l&apos;offre adaptée à votre activité</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Passez au plan supérieur pour débloquer plus de documents, la bibliothèque fournisseurs et les intégrations
          chantier.
        </p>
      </div>

      {abonnementActif && aCompteStripe && (
        <div className="rounded-[16px] border border-[#E6E9EB] bg-[#F8F9FA] px-4 py-4">
          <p className="text-sm font-medium text-foreground">Facturation Stripe</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Modifiez votre carte, consultez vos factures ou changez de formule depuis le portail sécurisé Stripe.
          </p>
          <div className="mt-3">
            <BoutonPortailStripe />
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS_TARINEO.map((plan) => {
          const actif = planActuel === plan.id;
          const selectionne = planSelectionne === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-[20px] border p-5 ${
                plan.misEnAvant ? "border-primary bg-[#FFF7F2]" : "border-[#E6E9EB] bg-white"
              } ${selectionne ? "ring-2 ring-primary ring-offset-2" : ""}`}
            >
              {plan.misEnAvant && (
                <Badge className="absolute -top-2.5 right-4 bg-primary text-white">Recommandé</Badge>
              )}
              {actif && <Badge variant="secondary" className="mb-2 w-fit">Votre plan</Badge>}
              <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{plan.nom}</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {plan.prixMensuel}€<span className="text-base font-normal text-muted-foreground">/mois</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span className={f.bientot ? "text-muted-foreground" : "text-foreground"}>
                      {f.label}
                      {f.bientot && <span className="ml-1 text-xs text-primary">(bientôt)</span>}
                    </span>
                  </li>
                ))}
              </ul>
              {!actif && !abonnementActif && (
                <Link
                  href={`/parametres?onglet=abonnement&plan=${plan.id}#paiement-stripe`}
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-white hover:opacity-95"
                >
                  Passer à {plan.nom}
                </Link>
              )}
              {!actif && abonnementActif && aCompteStripe && (
                <div className="mt-5">
                  <BoutonPortailStripe label={`Changer pour ${plan.nom}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Paiement sécurisé Stripe · TVA applicable · résiliation à tout moment depuis le portail de facturation.
      </p>
    </div>
  );
}
