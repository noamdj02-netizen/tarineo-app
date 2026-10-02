"use client";

import { DocumentImportPanels } from "@/components/metier/document-import-dialog";
import { DocumentDropzone } from "@/components/tarineo/documents/document-dropzone";
import { TarineoHdMascot } from "@/components/tarineo-hd-mascot";
import type { ChantierCard, Party } from "@/lib/metier/types";

export function DocumentAnalyseAgent({
  chantiers,
  clients,
}: {
  chantiers: ChantierCard[];
  clients: Party[];
}) {
  const chantier = chantiers.find((c) => c.status === "focus") ?? chantiers[0] ?? null;

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-6 px-1">
      <header className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <TarineoHdMascot name="06-loupe" className="h-16 w-18 shrink-0" label="" />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold tracking-[0.06em] text-[#FF6B1A] uppercase">Analyse IA</p>
            <h1 className="mt-1 font-display text-[28px] font-semibold tracking-tight text-ink">
              Lire un document BTP
            </h1>
            <p className="mt-1.5 max-w-[48ch] text-[15px] text-muted-foreground">
              Devis, factures, bons de commande, BL et bons d’enlèvement. Après import, l’agent affiche un récapitulatif
              et un score de fiabilité avant validation.
            </p>
          </div>
        </div>
        {chantier ? (
          <p className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13px] text-muted-foreground">
            Chantier par défaut :{" "}
            <span className="font-medium text-ink">{chantier.name}</span>
            {chantier.address ? ` — ${chantier.address}` : ""}.
          </p>
        ) : null}
      </header>

      <p className="rounded-xl border border-dashed border-line bg-surface-2 px-3.5 py-2.5 text-[12.5px] text-muted-foreground">
        TARINEO n’envoie que la <span className="font-medium text-ink">structure</span> du document (mise en page par
        enseigne) au catalogue communautaire anonyme — pas vos prix ni libellés produits. Vos corrections améliorent la
        lecture pour tout le réseau.
      </p>

      <DocumentDropzone
        title="Importer"
        description="À gauche : lecture guidée avec récap agent. À droite : lot jusqu’à 150 fichiers."
      >
        <DocumentImportPanels
          chantiers={chantiers}
          clients={clients}
          defaultChantierId={chantier?.id ?? null}
          showAgentMeta
          dropHint="PDF ou photo : devis, facture, bon de commande, BL…"
        />
      </DocumentDropzone>
    </div>
  );
}
