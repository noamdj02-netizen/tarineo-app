"use client";

import { DocumentBulkImport } from "@/components/metier/document-bulk-import";
import { DocumentDrop } from "@/components/metier/document-drop";
import type { ChantierCard, DocDirection, DocKind, Party } from "@/lib/metier/types";
import { cn } from "@/lib/utils";

export function DocumentImportPanels({
  chantiers,
  clients,
  compact,
  lockKind,
  lockDirection,
  defaultChantierId,
  showAgentMeta,
  dropHint,
  className,
}: {
  chantiers: ChantierCard[];
  clients?: Party[];
  compact?: boolean;
  lockKind?: DocKind;
  lockDirection?: DocDirection;
  defaultChantierId?: string | null;
  showAgentMeta?: boolean;
  dropHint?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-2 md:gap-5", className)}>
      <div className="flex flex-col gap-2">
        <div className="border-b border-line pb-2 md:border-0 md:pb-0">
          <p className="font-display text-[15px] font-semibold text-ink">Un document</p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            Vérifiez la lecture, le récap agent et les totaux avant d’enregistrer.
          </p>
        </div>
        <DocumentDrop
          chantiers={chantiers}
          clients={clients}
          compact={compact}
          lockKind={lockKind}
          lockDirection={lockDirection}
          defaultChantierId={defaultChantierId}
          showAgentMeta={showAgentMeta}
          hint={dropHint}
        />
      </div>
      <div className="flex flex-col gap-2 md:border-l md:border-line md:pl-5">
        <div className="border-b border-line pb-2 md:border-0 md:pb-0">
          <p className="font-display text-[15px] font-semibold text-ink">En masse</p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            Déposez plusieurs fichiers — enregistrement automatique après lecture (max. 150).
          </p>
        </div>
        <DocumentBulkImport
          chantiers={chantiers}
          clients={clients}
          compact={compact}
          lockKind={lockKind}
          lockDirection={lockDirection}
          defaultChantierId={defaultChantierId}
        />
      </div>
    </div>
  );
}
