"use client";

import { useState } from "react";
import Link from "next/link";
import { deconnecterIntegrationPennylane, exporterVersPennylaneMoisPrecedent } from "./actionsEquipe";
import { LogoIntegration } from "./LogoIntegration";

type Props = {
  connecte: boolean;
  configure: boolean;
  accesExport: boolean;
  redirectUri: string;
};

export function PennylaneCarte({ connecte, configure, accesExport, redirectUri }: Props) {
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function exporter() {
    setEnCours(true);
    setMessage(null);
    const resultat = await exporterVersPennylaneMoisPrecedent();
    setEnCours(false);
    if (!resultat.succes) {
      setMessage(resultat.erreur ?? "Échec de l'export.");
      return;
    }
    setMessage(
      `${resultat.exportes} document(s) exporté(s)${resultat.erreurs ? `, ${resultat.erreurs} erreur(s)` : ""}.`,
    );
  }

  async function deconnecter() {
    setEnCours(true);
    await deconnecterIntegrationPennylane();
    setEnCours(false);
    window.location.reload();
  }

  return (
    <div className="flex flex-col rounded-[20px] border border-[#E6E9EB] bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#EEF0F2] bg-white">
          <LogoIntegration nom="Pennylane" logo="https://img.logo.dev/pennylane.com?token=public" couleur="bg-[#E6FAF5] text-[#00D4AA]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-foreground">Pennylane</h3>
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                connecte
                  ? "border border-[var(--app-badge-success-bg)] bg-[var(--app-badge-success-bg)] text-[var(--app-badge-success-fg)]"
                  : "border border-[var(--app-badge-neutral-border)] bg-[var(--app-badge-neutral-bg)] text-[var(--app-badge-neutral-fg)]"
              }`}
            >
              {connecte ? "Connecté" : configure ? "Disponible" : "Bientôt"}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Exportez vos factures et bons d&apos;achat fournisseurs vers Pennylane sans ressaisie.
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs font-medium text-primary">Comptabilité · expert-comptable</p>

      <div className="mt-3 rounded-xl border border-[#EEF0F2] bg-[#F8F9FA] px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Configuration externe</p>
        <p className="mt-1 text-[11px] text-muted-foreground">URI de redirection OAuth</p>
        <code className="mt-0.5 block break-all text-xs font-medium text-foreground">{redirectUri}</code>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {!accesExport && (
          <Link
            href="/parametres?onglet=abonnement&plan=pro&paiement=1#paiement-stripe"
            className="app-btn-secondary text-sm"
          >
            Plan Pro requis
          </Link>
        )}
        {accesExport && configure && !connecte && (
          <a href="/api/integrations/pennylane/authorize" className="app-btn-primary text-sm">
            Connecter Pennylane
          </a>
        )}
        {connecte && (
          <>
            <button type="button" onClick={exporter} disabled={enCours} className="app-btn-primary text-sm disabled:opacity-50">
              {enCours ? "Export..." : "Exporter le mois précédent"}
            </button>
            <button type="button" onClick={deconnecter} disabled={enCours} className="app-btn-secondary text-sm disabled:opacity-50">
              Déconnecter
            </button>
          </>
        )}
        {!configure && (
          <span className="text-sm text-muted-foreground">Ajoutez PENNYLANE_CLIENT_ID et PENNYLANE_CLIENT_SECRET dans .env</span>
        )}
      </div>
      {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
