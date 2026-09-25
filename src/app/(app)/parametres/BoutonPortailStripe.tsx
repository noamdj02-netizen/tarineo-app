"use client";

import { useState } from "react";

export function BoutonPortailStripe({ label = "Gérer la facturation Stripe" }: { label?: string }) {
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function ouvrir() {
    setEnCours(true);
    setErreur(null);
    try {
      const reponse = await fetch("/api/stripe/portal", { method: "POST" });
      const donnees = (await reponse.json()) as { url?: string; erreur?: string };
      if (!reponse.ok || !donnees.url) {
        setErreur(donnees.erreur ?? "Impossible d'ouvrir le portail Stripe.");
        return;
      }
      window.location.href = donnees.url;
    } catch {
      setErreur("Connexion impossible. Réessayez dans un instant.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={ouvrir}
        disabled={enCours}
        className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[#E6E9EB] bg-white px-5 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-secondary active:scale-[0.99] disabled:opacity-50 sm:w-auto"
      >
        {enCours ? "Ouverture…" : label}
      </button>
      {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
    </div>
  );
}
