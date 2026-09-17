"use client";

import { useState } from "react";
import { changerMotDePasse } from "./actions";

export function FormulaireMotDePasse() {
  const [ancien, setAncien] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<{ type: "succes" | "erreur"; texte: string } | null>(null);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setEnCours(true);

    const formData = new FormData();
    formData.set("ancien", ancien);
    formData.set("nouveau", nouveau);
    formData.set("confirmation", confirmation);

    const resultat = await changerMotDePasse(formData);
    setEnCours(false);

    if (!resultat.succes) {
      setMessage({ type: "erreur", texte: resultat.erreur });
      return;
    }

    setMessage({ type: "succes", texte: resultat.message });
    setAncien("");
    setNouveau("");
    setConfirmation("");
  }

  return (
    <section className="mt-8 app-card p-5 sm:p-6">
      <h2 className="text-lg font-semibold">Changer de mot de passe</h2>
      <form onSubmit={soumettre} className="mt-4 space-y-3">
        <div>
          <label htmlFor="ancien" className="mb-1 block text-xs text-muted-foreground">
            Mot de passe actuel
          </label>
          <input
            id="ancien"
            type="password"
            required
            value={ancien}
            onChange={(e) => setAncien(e.target.value)}
            disabled={enCours}
            className="w-full app-input"
          />
        </div>
        <div>
          <label htmlFor="nouveau" className="mb-1 block text-xs text-muted-foreground">
            Nouveau mot de passe
          </label>
          <input
            id="nouveau"
            type="password"
            required
            minLength={8}
            value={nouveau}
            onChange={(e) => setNouveau(e.target.value)}
            disabled={enCours}
            className="w-full app-input"
          />
        </div>
        <div>
          <label htmlFor="confirmation" className="mb-1 block text-xs text-muted-foreground">
            Confirmer le nouveau mot de passe
          </label>
          <input
            id="confirmation"
            type="password"
            required
            minLength={8}
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            disabled={enCours}
            className="w-full app-input"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.type === "succes" ? "text-green-400" : "text-red-400"}`}>
            {message.texte}
          </p>
        )}

        <button
          type="submit"
          disabled={enCours}
          className="app-btn-secondary disabled:opacity-50"
        >
          {enCours ? "Enregistrement..." : "Mettre à jour le mot de passe"}
        </button>
      </form>
    </section>
  );
}
