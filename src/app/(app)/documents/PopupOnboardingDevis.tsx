"use client";

import { useEffect, useState } from "react";
import { marquerOnboardingDevisPopupVu } from "./actions";

export function PopupOnboardingDevis() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Marqué "vu" dès que ce composant est réellement monté dans le navigateur
    // d'un utilisateur — jamais lors d'un pré-rendu/prefetch côté serveur (qui
    // n'exécute pas useEffect), donc jamais "consommé" sans avoir été vu.
    marquerOnboardingDevisPopupVu();
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-popup-onboarding"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
    >
      <div className="w-full max-w-md app-card p-6 shadow-[var(--app-card-shadow)]">
        <p id="titre-popup-onboarding" className="app-display text-lg font-semibold text-[var(--foreground)]">
          Votre historique est prêt !
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Importez maintenant un devis reçu récemment pour voir Tarineo détecter une éventuelle hausse de prix.
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="mt-5 w-full app-btn-primary"
        >
          Importer un devis
        </button>
      </div>
    </div>
  );
}
