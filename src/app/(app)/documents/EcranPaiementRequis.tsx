"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe, type Stripe, type StripeElements } from "@stripe/stripe-js";
import { creerSetupIntentPaiement, verifierActivationCompte, type PlanValide } from "./stripeActions";

const PLANS: { nom: string; cle: PlanValide; prix: string; quota: string; historique: string }[] = [
  { nom: "Starter", cle: "starter", prix: "17", quota: "150", historique: "100" },
  { nom: "Pro", cle: "pro", prix: "29", quota: "400", historique: "200" },
  { nom: "Équipe", cle: "equipe", prix: "49", quota: "1 000", historique: "400" },
];

// Chargé une seule fois (module-scope) : loadStripe met lui-même en cache le script
// Stripe.js, mais on évite quand même de relancer un appel à chaque montage.
let stripePromise: Promise<Stripe | null> | null = null;
function obtenirStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");
  }
  return stripePromise;
}

// Palette alignée sur les tokens de globals.css, pour que le formulaire de carte
// Stripe (rendu dans une iframe, donc hors de portée de Tailwind) ne jure pas avec
// le reste de l'interface sombre.
const APPARENCE_STRIPE = {
  theme: "stripe" as const,
  variables: {
    colorBackground: "#ffffff",
    colorText: "#172935",
    colorTextSecondary: "#53616a",
    colorPrimary: "#ff6b16",
    colorDanger: "#ef4444",
    borderRadius: "12px",
  },
  rules: {
    ".Input": { border: "1px solid #e8eaed", backgroundColor: "#ffffff" },
    ".Tab": { border: "1px solid #e8eaed", backgroundColor: "#ffffff" },
  },
};

type Etape = "choix_plan" | "chargement_formulaire" | "formulaire" | "confirmation" | "activation" | "erreur";

// Écran affiché à la fin de l'essai gratuit (1 mois) si aucun moyen de paiement
// n'a été enregistré — bloque l'envoi de nouveaux documents (voir la vérification
// côté serveur dans src/app/(app)/documents/actions.ts, indépendante de cet
// affichage). L'ajout de carte passe par un SetupIntent Stripe (aucun prélèvement
// immédiat) ; c'est le webhook (src/app/api/stripe/webhook/route.ts), pas la
// confirmation côté navigateur, qui active réellement le compte — voir
// verifierActivationCompte ci-dessous.
export function EcranPaiementRequis({ bloque = true }: { bloque?: boolean }) {
  const router = useRouter();
  const [planChoisi, setPlanChoisi] = useState<PlanValide>("pro");
  const [etape, setEtape] = useState<Etape>("choix_plan");
  const [erreur, setErreur] = useState<string | null>(null);
  const conteneurRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const stripeRef = useRef<Stripe | null>(null);

  async function demarrerEnregistrementCarte() {
    setErreur(null);
    setEtape("chargement_formulaire");

    const resultat = await creerSetupIntentPaiement(planChoisi);
    if (!resultat.succes) {
      setErreur(resultat.erreur);
      setEtape("erreur");
      return;
    }

    const stripe = await obtenirStripe();
    if (!stripe || !conteneurRef.current) {
      setErreur("Le formulaire de paiement n'a pas pu se charger. Réessayez.");
      setEtape("erreur");
      return;
    }

    const elements = stripe.elements({ clientSecret: resultat.clientSecret, appearance: APPARENCE_STRIPE });
    elements.create("payment").mount(conteneurRef.current);
    stripeRef.current = stripe;
    elementsRef.current = elements;
    setEtape("formulaire");
  }

  async function validerCarte(e: React.FormEvent) {
    e.preventDefault();
    if (!stripeRef.current || !elementsRef.current) return;
    setErreur(null);
    setEtape("confirmation");

    const { error, setupIntent } = await stripeRef.current.confirmSetup({
      elements: elementsRef.current,
      redirect: "if_required",
    });

    if (error) {
      setErreur(error.message ?? "La carte n'a pas pu être enregistrée.");
      setEtape("formulaire");
      return;
    }
    if (setupIntent?.status !== "succeeded") {
      setErreur("L'enregistrement de la carte n'a pas abouti.");
      setEtape("formulaire");
      return;
    }

    // Le webhook met à jour le compte de façon asynchrone : on l'attend ici avant
    // de rafraîchir la page plutôt que de débloquer l'accès sur la seule
    // confirmation client (voir le commentaire d'en-tête du fichier).
    setEtape("activation");
    for (let tentative = 0; tentative < 15; tentative++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (await verifierActivationCompte()) {
        router.refresh();
        return;
      }
    }
    setErreur(
      "Carte enregistrée, mais l'activation prend plus de temps que prévu. Rechargez la page dans quelques instants."
    );
    setEtape("erreur");
  }

  function annuler() {
    elementsRef.current = null;
    stripeRef.current = null;
    setErreur(null);
    setEtape("choix_plan");
  }

  return (
    <div className="mt-6 app-banner">
      <p className="app-display text-lg font-semibold text-[var(--foreground)]">
        {bloque ? "Votre essai gratuit est terminé" : "Passer à un plan payant"}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-foreground">
        {bloque
          ? "Ajoutez un moyen de paiement pour continuer à importer et analyser vos documents. Aucun prélèvement immédiat — vous choisissez votre formule au moment d'enregistrer votre carte."
          : "Vous êtes encore en essai gratuit — rien ne vous oblige à passer à un plan payant dès maintenant. Vous pouvez néanmoins choisir votre formule ici, sans prélèvement immédiat."}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {PLANS.map((p) => {
          const selectionne = p.cle === planChoisi;
          return (
            <button
              key={p.cle}
              type="button"
              disabled={etape !== "choix_plan"}
              onClick={() => setPlanChoisi(p.cle)}
              aria-pressed={selectionne}
              className={`app-card-sm p-4 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                selectionne ? "border-[var(--accent)] bg-[#fff4eb]" : "hover:border-[var(--accent)]/50"
              }`}
            >
              <p className="text-sm font-bold uppercase tracking-wider text-[var(--muted)]">{p.nom}</p>
              <p className="mt-1 font-extrabold text-[var(--foreground)]">
                <span className="align-top text-base">€</span>
                <span className="text-2xl">{p.prix}</span>
                <span className="text-xs font-normal text-muted">/mois</span>
              </p>
              <p className="mt-1 text-xs text-muted">{p.quota} documents/mois</p>
              <p className="mt-0.5 text-xs text-muted">+ {p.historique} documents d&apos;import initial</p>
              <p className={`mt-2 text-xs font-medium ${selectionne ? "text-accent" : "text-transparent"}`}>
                ✓ Sélectionné
              </p>
            </button>
          );
        })}
      </div>

      {etape === "choix_plan" && (
        <button
          type="button"
          onClick={demarrerEnregistrementCarte}
          className="mt-5 w-full app-btn-primary"
        >
          Ajouter une carte bancaire — Plan {PLANS.find((p) => p.cle === planChoisi)?.nom}
        </button>
      )}

      {etape !== "choix_plan" && (
        <form onSubmit={validerCarte} className="mt-5">
          {etape === "chargement_formulaire" && (
            <p className="text-sm text-muted">Chargement du formulaire de paiement…</p>
          )}
          <div ref={conteneurRef} />

          {etape === "formulaire" && (
            <div className="mt-4 flex items-center gap-3">
              <button
                type="submit"
                className="app-btn-primary"
              >
                Valider ma carte
              </button>
              <button type="button" onClick={annuler} className="text-sm text-muted hover:text-foreground">
                Annuler
              </button>
            </div>
          )}
          {etape === "confirmation" && <p className="mt-3 text-sm text-muted">Vérification de la carte…</p>}
          {etape === "activation" && (
            <p className="mt-3 text-sm text-accent">Carte enregistrée — activation de votre compte…</p>
          )}
          {erreur && (
            <div className="mt-3">
              <p className="text-sm text-red-400">{erreur}</p>
              <button type="button" onClick={annuler} className="mt-2 text-sm text-muted hover:text-foreground">
                Recommencer
              </button>
            </div>
          )}
        </form>
      )}

      {etape === "choix_plan" && (
        <p className="mt-2 text-center text-xs text-muted">Paiement sécurisé par Stripe · sans engagement.</p>
      )}
    </div>
  );
}
