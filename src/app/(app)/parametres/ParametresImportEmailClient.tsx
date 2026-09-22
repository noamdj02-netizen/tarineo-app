"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

export function ParametresImportEmailClient({ adresse }: { adresse: string }) {
  const [copie, setCopie] = useState(false);
  const [aideOuverte, setAideOuverte] = useState(false);

  async function copier() {
    try {
      await navigator.clipboard.writeText(adresse);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    } catch {
      // Fallback silencieux — l'utilisateur peut sélectionner manuellement.
    }
  }

  return (
    <section className="rounded-[20px] border border-[#E6E9EB] bg-white p-5">
      <h2 className="text-base font-semibold">Import par e-mail</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Transférez vos PDF de devis ou factures fournisseurs à cette adresse — Tarineo les analyse
        automatiquement, comme un upload classique.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <p className="min-w-0 flex-1 rounded-lg bg-secondary px-4 py-3 text-sm text-foreground break-all">{adresse}</p>
        <button
          type="button"
          onClick={copier}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#E6E9EB] bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[#F8F8F8]"
        >
          {copie ? (
            <>
              <CheckIcon className="size-4 text-green-600" />
              Adresse copiée
            </>
          ) : (
            <>
              <CopyIcon className="size-4" />
              Copier l&apos;adresse
            </>
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setAideOuverte((v) => !v)}
        className="mt-3 text-sm font-medium text-primary hover:underline"
        aria-expanded={aideOuverte}
      >
        {aideOuverte ? "Masquer l'aide" : "Comment ça marche ?"}
      </button>

      {aideOuverte && (
        <ol className="mt-3 space-y-2 rounded-lg border border-[#E6E9EB] bg-[#FFF8F5] px-4 py-3 text-sm text-foreground">
          <li>
            <span className="font-medium">1.</span> Copiez l&apos;adresse ci-dessus.
          </li>
          <li>
            <span className="font-medium">2.</span> Depuis votre boîte mail habituelle, transférez le PDF reçu de
            Cedeo, Point P, Rexel…
          </li>
          <li>
            <span className="font-medium">3.</span> Tarineo reçoit le fichier, l&apos;analyse et vous notifie — retrouvez-le
            dans Mes documents.
          </li>
        </ol>
      )}
    </section>
  );
}
