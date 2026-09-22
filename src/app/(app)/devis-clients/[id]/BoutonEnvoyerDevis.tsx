"use client";

import { useState } from "react";
import { MailIcon } from "lucide-react";
import { envoyerDevisParEmail } from "./actions";

type Props = {
  clientQuoteId: string;
  clientEmail: string | null;
  accesPdf: boolean;
};

export function BoutonEnvoyerDevis({ clientQuoteId, clientEmail, accesPdf }: Props) {
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState(false);

  async function envoyer() {
    if (!clientEmail) {
      setErreur(true);
      setMessage("Ajoutez l'email du client dans le devis avant l'envoi.");
      return;
    }
    if (!accesPdf) {
      setErreur(true);
      setMessage("La génération PDF est réservée au plan Pro.");
      return;
    }

    setEnCours(true);
    setMessage(null);
    setErreur(false);
    const resultat = await envoyerDevisParEmail(clientQuoteId);
    setEnCours(false);

    if (!resultat.succes) {
      setErreur(true);
      setMessage(resultat.erreur ?? "Échec de l'envoi.");
      return;
    }
    setMessage(`Devis envoyé à ${clientEmail}.`);
  }

  return (
    <div>
      <button
        type="button"
        onClick={envoyer}
        disabled={enCours}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-50"
      >
        <MailIcon className="size-4" />
        {enCours ? "Envoi..." : "Envoyer au client"}
      </button>
      {message && (
        <p className={`mt-2 text-sm ${erreur ? "text-red-500" : "text-green-600"}`}>{message}</p>
      )}
    </div>
  );
}
