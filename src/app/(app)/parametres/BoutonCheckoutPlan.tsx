"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BoutonCheckoutPlan({ plan, label }: { plan: string; label: string }) {
  const [enCours, setEnCours] = useState(false);

  async function changerPlan() {
    setEnCours(true);
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
      alert(data.erreur ?? "Impossible d'ouvrir le paiement.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <Button type="button" size="sm" className="mt-5 w-full rounded-full" disabled={enCours} onClick={changerPlan}>
      {enCours ? "Redirection…" : label}
    </Button>
  );
}
