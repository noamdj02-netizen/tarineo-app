"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BoutonPortailStripe } from "../parametres/BoutonPortailStripe";
import { resilierAbonnement } from "./actions";

interface Props {
  planLabel: string;
  intervalle: "month" | "year";
  dateFin: string;
  resiliationDejaProgrammee: boolean;
}

// Un seul mécanisme Stripe (cancel_at_period_end) sert les deux cas : "résilier"
// pour un abonnement mensuel et "désactiver le renouvellement" pour un annuel ne
// sont que deux libellés différents pour la même action côté serveur (voir
// resilierAbonnement dans actions.ts) — aucun des deux ne coupe l'accès avant la
// fin de la période déjà payée, ni ne rembourse au prorata.
export function GestionAbonnement({ planLabel, intervalle, dateFin, resiliationDejaProgrammee }: Props) {
  const router = useRouter();
  const [programmee, setProgrammee] = useState(resiliationDejaProgrammee);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function confirmer() {
    // Même garde-fou natif que BoutonSuppression.tsx pour la suppression de compte —
    // une action à conséquence similaire (arrêt du service) doit avoir le même niveau
    // de protection contre un clic accidentel.
    const texteConfirmation =
      intervalle === "month"
        ? `Confirmez-vous la résiliation ? Votre accès restera actif jusqu'au ${dateFin}, sans remboursement au prorata.`
        : `Confirmez-vous la désactivation du renouvellement automatique ? Votre accès prendra fin le ${dateFin}.`;
    if (!confirm(texteConfirmation)) return;

    setEnCours(true);
    setErreur(null);
    const resultat = await resilierAbonnement();
    setEnCours(false);

    if (!resultat.succes) {
      setErreur(resultat.erreur);
      return;
    }
    setMessage(resultat.message);
    setProgrammee(true);
    router.refresh();
  }

  return (
    <section className="mt-8 app-card p-5 sm:p-6">
      <h2 className="text-lg font-semibold">Gérer mon abonnement</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Plan {planLabel} · {intervalle === "month" ? "facturation mensuelle" : "engagement annuel"}
      </p>

      <div className="mt-4">
        <BoutonPortailStripe />
      </div>

      {intervalle === "month" ? (
        programmee ? (
          <p className="mt-4 text-sm text-foreground">
            Résiliation confirmée — votre accès reste actif jusqu&apos;au <strong>{dateFin}</strong>, sans nouveau
            prélèvement après cette date.
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm text-muted-foreground">
              Vous pouvez résilier à tout moment. Aucun remboursement au prorata : votre accès reste actif jusqu&apos;à
              la fin de la période déjà payée, le <strong className="text-foreground">{dateFin}</strong>.
            </p>
            <button
              type="button"
              onClick={confirmer}
              disabled={enCours}
              className="mt-4 rounded-md border border-red-900/40 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              {enCours ? "Résiliation en cours..." : "Résilier mon abonnement"}
            </button>
          </>
        )
      ) : programmee ? (
        <p className="mt-4 text-sm text-foreground">
          Renouvellement automatique désactivé — votre accès prendra fin le{" "}
          <strong>{dateFin}</strong>.
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            Votre engagement annuel court jusqu&apos;au <strong className="text-foreground">{dateFin}</strong>. Vous
            pourrez choisir de ne pas le renouveler à cette date.
          </p>
          <button
            type="button"
            onClick={confirmer}
            disabled={enCours}
            className="mt-4 app-btn-secondary disabled:opacity-50"
          >
            {enCours ? "Mise à jour..." : "Désactiver le renouvellement automatique"}
          </button>
        </>
      )}

      {message && <p className="mt-3 text-sm text-green-400">{message}</p>}
      {erreur && <p className="mt-3 text-sm text-red-400">{erreur}</p>}
    </section>
  );
}
