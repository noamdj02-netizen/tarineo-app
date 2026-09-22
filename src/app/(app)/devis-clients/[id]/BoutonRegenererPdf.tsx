"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { regenererPdfDevis } from "./actions";
import { BadgePlanPro, LienPasserPro } from "@/components/tarineo/BadgePlanPro";
import { messageFonctionPlanRequise } from "@/lib/planGating";

export function BoutonRegenererPdf({
  clientQuoteId,
  accesPdf = true,
}: {
  clientQuoteId: string;
  accesPdf?: boolean;
}) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [erreurPlan, setErreurPlan] = useState(false);
  const [echec, setEchec] = useState(false);

  async function regenerer() {
    if (!accesPdf) {
      setErreurPlan(true);
      return;
    }
    setEnCours(true);
    setEchec(false);
    setErreurPlan(false);
    const resultat = await regenererPdfDevis(clientQuoteId);
    setEnCours(false);
    if (!resultat.succes) {
      if (resultat.erreurPlan) {
        setErreurPlan(true);
      } else {
        setEchec(true);
      }
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={regenerer}
        disabled={enCours}
        className="app-btn-primary inline-flex items-center gap-2 disabled:opacity-50"
      >
        {enCours ? "Génération..." : "Générer le PDF"}
        {!accesPdf && <BadgePlanPro />}
      </button>
      {erreurPlan && (
        <p className="mt-2 text-sm text-foreground">
          {messageFonctionPlanRequise("devis_pdf")}{" "}
          <LienPasserPro className="inline" />
        </p>
      )}
      {echec && !erreurPlan && (
        <p className="mt-2 text-sm text-red-400">Échec de la génération, réessayez.</p>
      )}
    </div>
  );
}
