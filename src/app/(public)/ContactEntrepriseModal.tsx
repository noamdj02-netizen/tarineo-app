"use client";

import { useState } from "react";
import { envoyerDemandeContactEntreprise } from "./contactEntrepriseActions";

const champClasse =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent";
const labelClasse = "mb-1 block text-xs text-muted";

// Modale pure, contrôlée par le parent (voir le 3ème bouton "Entreprise" du sélecteur
// dans PricingSection.tsx) — pas de déclencheur ici, pour que ce bouton puisse partager
// exactement le même style que Mensuel/Annuel dans la pilule. Pas d'espace client dédié,
// juste un email envoyé via envoyerDemandeContactEntreprise (src/lib/email.ts).
export function ContactEntrepriseModal({ ouvert, onFermer }: { ouvert: boolean; onFermer: () => void }) {
  const [enCours, setEnCours] = useState(false);
  const [resultat, setResultat] = useState<{ type: "succes" | "erreur"; texte: string } | null>(null);

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResultat(null);
    setEnCours(true);

    const reponse = await envoyerDemandeContactEntreprise(new FormData(e.currentTarget));
    setEnCours(false);

    if (!reponse.succes) {
      setResultat({ type: "erreur", texte: reponse.erreur });
      return;
    }
    setResultat({ type: "succes", texte: "Merci, votre demande a bien été envoyée — nous vous répondons rapidement." });
  }

  if (!ouvert) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onFermer();
      }}
      className="fixed inset-0 z-[200] overflow-y-auto bg-black/70 px-6 py-16"
    >
      <div className="relative mx-auto max-w-md rounded-2xl border border-border bg-surface p-8">
        <button
          type="button"
          onClick={onFermer}
          aria-label="Fermer"
          className="absolute right-4 top-4 text-xl text-muted hover:text-foreground"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold text-white">Offre sur mesure</h3>
        <p className="mt-1 text-sm text-muted">
          Décrivez-nous votre besoin, nous revenons vers vous rapidement pour construire une offre adaptée.
        </p>

        <form onSubmit={soumettre} className="mt-6 space-y-3">
          <div>
            <label htmlFor="contact-entreprise-nom" className={labelClasse}>
              Nom
            </label>
            <input id="contact-entreprise-nom" name="nom" required disabled={enCours} className={champClasse} />
          </div>
          <div>
            <label htmlFor="contact-entreprise-email" className={labelClasse}>
              Email
            </label>
            <input
              id="contact-entreprise-email"
              name="email"
              type="email"
              required
              disabled={enCours}
              className={champClasse}
            />
          </div>
          <div>
            <label htmlFor="contact-entreprise-volume" className={labelClasse}>
              Taille d&apos;équipe ou volume de documents estimé
            </label>
            <input
              id="contact-entreprise-volume"
              name="volume"
              required
              disabled={enCours}
              placeholder="Ex. : 15 personnes, ~2000 documents/mois"
              className={champClasse}
            />
          </div>
          <div>
            <label htmlFor="contact-entreprise-message" className={labelClasse}>
              Message (optionnel)
            </label>
            <textarea id="contact-entreprise-message" name="message" rows={3} disabled={enCours} className={champClasse} />
          </div>

          {/* Honeypot anti-spam : invisible et inatteignable pour un visiteur humain (hors
              du flux du tabulateur, masqué), rempli par la plupart des bots qui soumettent
              tous les champs d'un formulaire sans distinction. */}
          <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
            <input type="text" name="siteWeb" tabIndex={-1} autoComplete="off" />
          </div>

          {resultat && (
            <p className={`text-sm ${resultat.type === "succes" ? "text-green-400" : "text-red-400"}`}>
              {resultat.texte}
            </p>
          )}

          <button
            type="submit"
            disabled={enCours}
            className="w-full rounded-full bg-accent py-3 text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {enCours ? "Envoi..." : "Envoyer la demande"}
          </button>
        </form>
      </div>
    </div>
  );
}
