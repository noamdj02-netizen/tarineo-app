"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { transformerEnFacture } from "./actions";

export function BoutonTransformerEnFacture({ clientQuoteId }: { clientQuoteId: string }) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function transformer() {
    setEnCours(true);
    setErreur(null);
    const resultat = await transformerEnFacture(clientQuoteId);
    setEnCours(false);
    if (!resultat.succes) {
      setErreur(resultat.erreur);
      return;
    }
    router.push(`/factures-clients/${resultat.factureId}`);
  }

  return (
    <div>
      <button
        type="button"
        onClick={transformer}
        disabled={enCours}
        className="rounded-md border border-accent px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10 disabled:opacity-50"
      >
        {enCours ? "Transformation..." : "Transformer en facture"}
      </button>
      {erreur && <p className="mt-2 text-sm text-red-400">{erreur}</p>}
    </div>
  );
}
