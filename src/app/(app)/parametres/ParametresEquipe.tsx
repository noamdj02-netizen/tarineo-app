"use client";

import { useState } from "react";
import Link from "next/link";
import { inviterCollaborateur, retirerCollaborateur } from "./actionsEquipe";

type Membre = { id: string; userId: string; role: string; email: string; name: string | null };
type Invitation = { id: string; email: string; expiresAt: string };

type Props = {
  accesEquipe: boolean;
  nomEquipe: string;
  membres: Membre[];
  invitations: Invitation[];
};

export function ParametresEquipe({ accesEquipe, nomEquipe, membres, invitations }: Props) {
  const [email, setEmail] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function inviter() {
    setEnCours(true);
    setMessage(null);
    const resultat = await inviterCollaborateur(email);
    setEnCours(false);
    if (!resultat.succes) {
      setMessage(resultat.erreur ?? "Invitation impossible.");
      return;
    }
    setEmail("");
    setMessage("Invitation envoyée par email.");
  }

  async function retirer(userId: string) {
    setEnCours(true);
    await retirerCollaborateur(userId);
    setEnCours(false);
    window.location.reload();
  }

  if (!accesEquipe) {
    return (
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Équipe chantier</h2>
        <p className="text-sm text-muted-foreground">
          Invitez des chefs de chantier à importer des documents dans votre espace. Réservé au plan Équipe.
        </p>
        <Link
          href="/parametres?onglet=abonnement&plan=equipe&paiement=1#paiement-stripe"
          className="inline-flex app-btn-primary text-sm"
        >
          Passer au plan Équipe
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Équipe — {nomEquipe}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Jusqu&apos;à 5 collaborateurs peuvent importer des documents et consulter vos alertes de prix.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@collaborateur.fr"
          className="app-input flex-1"
        />
        <button type="button" onClick={inviter} disabled={enCours || !email.trim()} className="app-btn-primary disabled:opacity-50">
          {enCours ? "Envoi..." : "Inviter"}
        </button>
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      {membres.length > 0 && (
        <div>
          <h3 className="text-sm font-medium">Membres actifs</h3>
          <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
            {membres.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{m.name ?? m.email}</p>
                  <p className="text-muted-foreground">{m.email}</p>
                </div>
                {m.role !== "owner" && (
                  <button type="button" onClick={() => retirer(m.userId)} className="text-sm text-red-500 hover:underline">
                    Retirer
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {invitations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium">Invitations en attente</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {invitations.map((inv) => (
              <li key={inv.id}>
                {inv.email} — expire le {new Date(inv.expiresAt).toLocaleDateString("fr-FR")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
