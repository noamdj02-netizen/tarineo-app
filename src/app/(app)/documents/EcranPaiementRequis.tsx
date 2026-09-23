"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loadStripe, type Stripe, type StripeElements } from "@stripe/stripe-js";
import { creerSetupIntentPaiement, verifierActivationCompte, type PlanValide } from "./stripeActions";

const PLANS: { nom: string; cle: PlanValide; prix: string; quota: string; historique: string }[] = [
  { nom: "Starter", cle: "starter", prix: "17", quota: "150", historique: "150" },
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
export function EcranPaiementRequis({
  bloque = true,
  planInitial = "pro",
  autoDemarrer = false,
  masquerGrillePlans = false,
}: {
  bloque?: boolean;
  planInitial?: PlanValide;
  /** Ouvre directement le formulaire Stripe pour le plan choisi. */
  autoDemarrer?: boolean;
  /** Masque la grille de sélection quand le plan est déjà choisi (ex. depuis Paramètres). */
  masquerGrillePlans?: boolean;
}) {
  const router = useRouter();
  const [planChoisi, setPlanChoisi] = useState<PlanValide>(planInitial);
  const [etape, setEtape] = useState<Etape>("choix_plan");
  const [erreur, setErreur] = useState<string | null>(null);
  const conteneurRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const stripeRef = useRef<Stripe | null>(null);
  const demarreRef = useRef(false);
  const planAffiche = PLANS.find((p) => p.cle === planChoisi);

  useEffect(() => {
    setPlanChoisi(planInitial);
  }, [planInitial]);

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

  useEffect(() => {
    if (!autoDemarrer || demarreRef.current) return;
    demarreRef.current = true;
    void demarrerEnregistrementCarte();
  }, [autoDemarrer, planInitial]);

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
      <div className="flex flex-col items-center text-center">
        <Image src="/landing/logo-mark.png" alt="" width={48} height={48} className="size-12" />
        <p className="app-display mt-3 text-lg font-semibold text-[var(--foreground)]">
          {bloque ? "Votre essai gratuit est terminé" : `Plan ${planAffiche?.nom ?? "Tarineo"}`}
        </p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-foreground">
          {bloque
            ? "Ajoutez votre carte pour continuer à importer et analyser vos documents. Paiement sécurisé Stripe."
            : masquerGrillePlans
              ? `Réglez votre abonnement ${planAffiche?.nom} (${planAffiche?.prix} €/mois) — directement dans Tarineo.`
              : "Choisissez votre formule puis validez votre carte. Paiement sécurisé Stripe."}
        </p>
      </div>

      {masquerGrillePlans && planAffiche && (
        <div className="mx-auto mt-5 max-w-sm rounded-2xl border border-[var(--accent)]/30 bg-[#fff4eb] px-4 py-3 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{planAffiche.nom}</p>
          <p className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">
            {planAffiche.prix} €<span className="text-sm font-normal text-muted-foreground">/mois</span>
          </p>
        </div>
      )}

      {!masquerGrillePlans && (
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
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{p.nom}</p>
                <p className="mt-1 font-extrabold text-[var(--foreground)]">
                  <span className="align-top text-base">€</span>
                  <span className="text-2xl">{p.prix}</span>
                  <span className="text-xs font-normal text-muted-foreground">/mois</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{p.quota} documents/mois</p>
                <p className="mt-0.5 text-xs text-muted-foreground">+ {p.historique} documents d&apos;import initial</p>
                <p className={`mt-2 text-xs font-medium ${selectionne ? "text-accent" : "text-transparent"}`}>
                  ✓ Sélectionné
                </p>
              </button>
            );
          })}
        </div>
      )}

      {etape === "choix_plan" && !autoDemarrer && (
        <button type="button" onClick={demarrerEnregistrementCarte} className="mt-5 w-full app-btn-primary">
          Payer — Plan {planAffiche?.nom}
        </button>
      )}

      {etape !== "choix_plan" && (
        <form onSubmit={validerCarte} className="mt-5">
          {etape === "chargement_formulaire" && (
            <p className="text-sm text-muted-foreground">Chargement du formulaire de paiement…</p>
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
              <button type="button" onClick={annuler} className="text-sm text-muted-foreground hover:text-foreground">
                Annuler
              </button>
            </div>
          )}
          {etape === "confirmation" && <p className="mt-3 text-sm text-muted-foreground">Vérification de la carte…</p>}
          {etape === "activation" && (
            <p className="mt-3 text-sm text-accent">Carte enregistrée — activation de votre compte…</p>
          )}
          {erreur && (
            <div className="mt-3">
              <p className="text-sm text-red-400">{erreur}</p>
              <button type="button" onClick={annuler} className="mt-2 text-sm text-muted-foreground hover:text-foreground">
                Recommencer
              </button>
            </div>
          )}
        </form>
      )}

      {etape === "choix_plan" && (
        <p className="mt-2 text-center text-xs text-muted-foreground">Paiement sécurisé par Stripe · sans engagement.</p>
      )}
    </div>
  );
}
