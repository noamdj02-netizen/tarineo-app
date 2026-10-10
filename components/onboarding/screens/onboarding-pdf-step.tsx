"use client";

import { FileUp, Sparkles } from "lucide-react";
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
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="flex items-start gap-4">
        <TarineoHdMascot
          name="07-ordinateur"
          className="h-20 w-24 shrink-0 sm:h-24 sm:w-28"
          label=""
        />
        <div className="min-w-0 pt-1">
          <p className="mono-label mb-1.5">/ Premier PDF ///</p>
          <h2 className="font-display text-[clamp(1.35rem,4vw,1.65rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-ink text-balance">
            Déposez un devis distributeur
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            Cedeo, Rexel… TARINEO lit les lignes tout de suite — SIRET plus tard, à l’envoi client.
          </p>
        </div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        <li className="flex items-center gap-2.5 rounded-2xl bg-wash-orange/60 px-3.5 py-2.5 text-[13px] text-ink/85">
          <FileUp className="size-4 shrink-0 text-tarineo-orange" aria-hidden />
          PDF fournisseur uniquement
        </li>
        <li className="flex items-center gap-2.5 rounded-2xl bg-wash-orange/60 px-3.5 py-2.5 text-[13px] text-ink/85">
          <Sparkles className="size-4 shrink-0 text-tarineo-orange" aria-hidden />
          Lignes analysées automatiquement
        </li>
      </ul>

      <div className="min-h-0 flex-1 rounded-[22px] bg-wash-orange/35 p-2 ring-1 ring-tarineo-orange/15 sm:p-3">
        <DocumentDrop
          chantiers={chantiers}
          clients={clients}
          compact
          lockDirection="in"
          lockKind="devis"
          hint="PDF devis fournisseur / enseigne."
          onDocumentSaved={onSaved}
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        className="min-h-11 self-center rounded-full text-[13.5px] text-muted-foreground hover:text-ink"
        disabled={pending}
        onClick={onSkip}
      >
        Passer — j’importerai plus tard
      </Button>
    </div>
  );
}
