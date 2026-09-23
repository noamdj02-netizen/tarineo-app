"use client";

import { useState } from "react";
import { enregistrerParametresComptable } from "./actionsComptable";

type Props = {
  emailComptable: string | null;
  exportComptableAuto: boolean;
  accesExport: boolean;
};

export function ParametresComptable({ emailComptable, exportComptableAuto, accesExport }: Props) {
  const [email, setEmail] = useState(emailComptable ?? "");
  const [auto, setAuto] = useState(exportComptableAuto);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function enregistrer() {
    setEnCours(true);
    setMessage(null);
    const resultat = await enregistrerParametresComptable({ emailComptable: email, exportComptableAuto: auto });
    setEnCours(false);
    setMessage(resultat.succes ? "Paramètres enregistrés." : (resultat.erreur ?? "Erreur."));
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Export comptable automatique</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Le 1er de chaque mois, Tarineo envoie un fichier Excel des achats du mois précédent à votre expert-comptable
          (plan Pro requis).
        </p>
      </div>

      {!accesExport && (
        <p className="rounded-xl bg-[#FFF7F2] px-4 py-3 text-sm text-foreground">
          L&apos;export comptable automatique est inclus dans le plan Pro.{" "}
          <a
            href="/parametres?onglet=abonnement&plan=pro&paiement=1#paiement-stripe"
            className="font-medium text-primary hover:underline"
          >
            Passer à Pro
          </a>
        </p>
      )}

      <div>
        <label htmlFor="emailComptable" className="mb-1 block text-sm font-medium">Email du comptable</label>
        <input
          id="emailComptable"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="comptable@cabinet.fr"
          className="app-input max-w-md"
          disabled={!accesExport}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={auto}
          onChange={(e) => setAuto(e.target.checked)}
          disabled={!accesExport || !email.trim()}
          className="size-4 rounded border-border accent-orange-500"
        />
        Envoyer automatiquement chaque mois
      </label>

      <button
        type="button"
        onClick={enregistrer}
        disabled={enCours || !accesExport}
        className="app-btn-primary disabled:opacity-50"
      >
        {enCours ? "Enregistrement..." : "Enregistrer"}
      </button>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
