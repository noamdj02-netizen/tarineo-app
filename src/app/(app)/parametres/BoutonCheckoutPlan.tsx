"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BoutonCheckoutPlan({ plan, label }: { plan: string; label: string }) {
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function changerPlan() {
    setEnCours(true);
    setErreur(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; erreur?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setErreur(data.erreur ?? "Impossible d'ouvrir le paiement.");
    } catch {
      setErreur("Connexion impossible. Réessayez dans un instant.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="mt-5 w-full">
      <Button type="button" size="sm" className="w-full rounded-full" disabled={enCours} onClick={changerPlan}>
        {enCours ? "Redirection…" : label}
      </Button>
      {erreur && (
        <p className="mt-2 text-center text-xs text-destructive" role="alert">
          {erreur}
        </p>
      )}
    </div>
  );
}
