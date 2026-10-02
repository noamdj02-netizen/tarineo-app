"use client";

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
  return (
    <Dialog>
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
      <DialogContent className="max-h-[min(92dvh,880px)] overflow-y-auto sm:max-w-3xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>Importer des documents</DialogTitle>
          <DialogDescription>
            Un fichier avec relecture complète, ou un lot jusqu’à 150 documents en enregistrement automatique.
          </DialogDescription>
        </DialogHeader>
        <DocumentImportPanels chantiers={chantiers} clients={clients} compact showAgentMeta />
      </DialogContent>
    </Dialog>
  );
}
