"use client";

import { DocumentDrop } from "@/components/metier/document-drop";
import { TarineoHdMascot } from "@/components/tarineo-hd-mascot";
import { Button } from "@/components/ui/button";
import type { ChantierCard, Party } from "@/lib/metier/types";

export function OnboardingPdfStep({
  chantiers,
  clients = [],
  onSkip,
  onSaved,
  pending,
}: {
  chantiers: ChantierCard[];
  clients?: Party[];
  onSkip: () => void;
  onSaved?: () => void;
  pending?: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <TarineoHdMascot name="07-ordinateur" className="h-24 w-28 self-center shrink-0" label="" />
      <div>
        <h2 className="font-display text-[24px] font-semibold tracking-tight">Déposez un devis distributeur</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          PDF Cedeo, Rexel, etc. TARINEO lit les lignes tout de suite — sans SIRET pour l’instant.
        </p>
      </div>
      <DocumentDrop
        chantiers={chantiers}
        clients={clients}
        compact
        lockDirection="in"
        lockKind="devis"
        hint="PDF devis fournisseur / enseigne."
        onDocumentSaved={onSaved}
      />
      <Button
        type="button"
        variant="ghost"
        className="min-h-11 self-center rounded-full text-muted-foreground"
        disabled={pending}
        onClick={onSkip}
      >
        Passer — j’importerai plus tard
      </Button>
    </div>
  );
}
