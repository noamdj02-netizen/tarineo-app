"use client";

import { useCallback, useState } from "react";
import { DocumentBulkImport } from "@/components/metier/document-bulk-import";
import {
  DocumentDrop,
  type DocumentSavedInfo,
} from "@/components/metier/document-drop";
import type { ChantierCard, DocDirection, DocKind, Party } from "@/lib/metier/types";
import { cn } from "@/lib/utils";

type ImportMode = "single" | "bulk";

export function DocumentImportPanels({
  chantiers,
  clients,
  compact,
  lockKind,
  lockDirection,
  defaultChantierId,
  showAgentMeta,
  dropHint,
  filmLecture,
  className,
  onPhaseChange,
  onDocumentSaved,
  stayAfterSave,
  onBulkComplete,
  defaultMode = "single",
}: {
  chantiers: ChantierCard[];
  clients?: Party[];
  compact?: boolean;
  lockKind?: DocKind;
  lockDirection?: DocDirection;
  defaultChantierId?: string | null;
  showAgentMeta?: boolean;
  dropHint?: string;
  filmLecture?: boolean;
  className?: string;
  /** `pick` = zones d’import ; `review` = lecture agent seule. */
  onPhaseChange?: (phase: "pick" | "review") => void;
  onDocumentSaved?: (info?: DocumentSavedInfo) => void;
  stayAfterSave?: boolean;
  onBulkComplete?: (info: { savedCount: number; lastId: string | null }) => void;
  defaultMode?: ImportMode;
}) {
  const [reviewing, setReviewing] = useState(false);
  const [mode, setMode] = useState<ImportMode>(defaultMode);

  const setPhase = useCallback(
    (next: boolean) => {
      setReviewing(next);
      onPhaseChange?.(next ? "review" : "pick");
    },
    [onPhaseChange],
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {!reviewing ? (
        <div className="flex gap-1 rounded-[12px] border border-line bg-surface-2 p-1" role="tablist">
          {(
            [
              { id: "single" as const, label: "Un document", hint: "Récap agent" },
              { id: "bulk" as const, label: "En masse", hint: "Jusqu’à 150" },
            ] as const
          ).map((tab) => {
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(tab.id)}
                className={cn(
                  "flex min-h-11 flex-1 flex-col items-center justify-center rounded-[10px] px-3 py-2 text-center transition-[background-color,color] duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange-ring",
                  active
                    ? "bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    : "text-muted-foreground hover:text-ink",
                )}
              >
                <span className="text-[13.5px] font-medium">{tab.label}</span>
                <span className="text-[11px] text-muted-foreground">{tab.hint}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {mode === "single" || reviewing ? (
        <div className={cn("flex flex-col gap-2", reviewing && "min-w-0")}>
          {!reviewing ? (
            <div>
              <p className="font-display text-[15px] font-semibold text-ink">Lecture guidée</p>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                Vérifiez le récap agent et les totaux avant d’enregistrer.
              </p>
            </div>
          ) : null}
          <DocumentDrop
            chantiers={chantiers}
            clients={clients}
            compact={compact}
            lockKind={lockKind}
            lockDirection={lockDirection}
            defaultChantierId={defaultChantierId}
            showAgentMeta={showAgentMeta}
            hint={dropHint}
            filmLecture={filmLecture}
            onDraftActive={setPhase}
            onDocumentSaved={onDocumentSaved}
            stayAfterSave={stayAfterSave}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div>
            <p className="font-display text-[15px] font-semibold text-ink">Import en masse</p>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              Enregistrement automatique après lecture (max. 150 fichiers).
            </p>
          </div>
          <DocumentBulkImport
            chantiers={chantiers}
            clients={clients}
            compact={compact}
            lockKind={lockKind}
            lockDirection={lockDirection}
            defaultChantierId={defaultChantierId}
            stayAfterSave={stayAfterSave}
            onBulkComplete={onBulkComplete}
          />
        </div>
      )}
    </div>
  );
}
