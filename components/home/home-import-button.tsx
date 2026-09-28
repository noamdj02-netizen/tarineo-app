"use client";

import { DocumentDrop } from "@/components/metier/document-drop";
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
      <DialogContent className="max-h-[min(90dvh,760px)] overflow-y-auto sm:max-w-xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>Importer un document</DialogTitle>
          <DialogDescription>
            Même lecture qu’ailleurs : type, total HT, éco-contribution si le document les porte.
          </DialogDescription>
        </DialogHeader>
        <DocumentDrop chantiers={chantiers} clients={clients} compact />
      </DialogContent>
    </Dialog>
  );
}
