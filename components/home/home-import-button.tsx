"use client";

import { useCallback, useState } from "react";
import { DocumentImportPanels } from "@/components/metier/document-import-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ChantierCard, Party } from "@/lib/metier/types";
import { cn } from "@/lib/utils";

export function HomeImportButton({
  chantiers,
  clients,
  className,
}: {
  chantiers: ChantierCard[];
  clients: Party[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"pick" | "review">("pick");

  const onPhaseChange = useCallback((next: "pick" | "review") => {
    setPhase(next);
  }, []);

  const onDocumentSaved = useCallback(() => {
    setOpen(false);
    setPhase("pick");
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setPhase("pick");
      }}
    >
      <DialogTrigger
        render={
          <button
            type="button"
            className={cn(
              "inline-flex h-[38px] items-center rounded-[10px] border border-line bg-surface px-4 text-[13px] font-medium text-ink transition-colors duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-orange/35",
              className,
            )}
          />
        }
      >
        Importer
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[min(92dvh,880px)] w-full flex-col gap-3 overflow-hidden sm:max-w-3xl md:top-[max(1.25rem,5dvh)] md:translate-y-0"
        showCloseButton
      >
        <DialogHeader className="shrink-0 pr-8">
          <DialogTitle>
            {phase === "review" ? "Lecture du document" : "Importer des documents"}
          </DialogTitle>
          <DialogDescription>
            {phase === "review"
              ? "Vérifiez le récap agent et les totaux, puis enregistrez — vous ouvrirez ensuite la fiche du document."
              : "Un fichier avec relecture complète, ou un lot jusqu’à 150 documents en enregistrement automatique."}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
          <DocumentImportPanels
            chantiers={chantiers}
            clients={clients}
            compact
            showAgentMeta
            onPhaseChange={onPhaseChange}
            onDocumentSaved={onDocumentSaved}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
