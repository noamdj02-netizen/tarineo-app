"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { regenererPdfFacture } from "./actions";

export function BoutonRegenererPdfFacture({ clientInvoiceId }: { clientInvoiceId: string }) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [echec, setEchec] = useState(false);

  async function regenerer() {
    setEnCours(true);
    setEchec(false);
    const resultat = await regenererPdfFacture(clientInvoiceId);
    setEnCours(false);
    if (!resultat.succes) {
      setEchec(true);
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
        className="app-btn-primary disabled:opacity-50"
      >
        {enCours ? "Génération..." : "Générer le PDF"}
      </button>
      {echec && <p className="mt-2 text-sm text-red-400">Échec de la génération, réessayez.</p>}
    </div>
  );
}
