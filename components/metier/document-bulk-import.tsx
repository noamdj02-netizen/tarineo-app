"use client";

import { CheckCircle2, Files, Loader2, Upload, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { confirmDocument, ingestDocument } from "@/app/(app)/metier/actions";
import { Button } from "@/components/ui/button";
import { confirmPayloadFromExtract } from "@/lib/metier/confirm-payload";
import type { ChantierCard, DocDirection, DocKind, Party } from "@/lib/metier/types";
import { hrefAfterDocumentSave, pieceListHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

const MAX_FILES = 150;
const ACCEPT = "application/pdf,image/jpeg,image/png,image/heic,image/webp";

type QueueItem = {
  id: string;
  file: File;
  status: "pending" | "reading" | "saving" | "done" | "error";
  error?: string;
};

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function DocumentBulkImport({
  chantiers,
  compact,
  lockKind,
  lockDirection,
  defaultChantierId,
}: {
  chantiers: ChantierCard[];
  clients?: Party[];
  compact?: boolean;
  lockKind?: DocKind;
  lockDirection?: DocDirection;
  defaultChantierId?: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [running, setRunning] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const next: QueueItem[] = [];
    const seen = new Set(queue.map((q) => q.id));
    for (const file of Array.from(files)) {
      if (next.length + queue.length >= MAX_FILES) break;
      const id = fileKey(file);
      if (seen.has(id)) continue;
      seen.add(id);
      next.push({ id, file, status: "pending" });
    }
    if (!next.length) {
      setGlobalError(`Maximum ${MAX_FILES} fichiers par lot.`);
      return;
    }
    setGlobalError(null);
    setQueue((q) => [...q, ...next]);
  }

  function removeItem(id: string) {
    if (running) return;
    setQueue((q) => q.filter((i) => i.id !== id));
  }

  async function runQueue() {
    if (!queue.length || running) return;
    setRunning(true);
    setGlobalError(null);
    let failures = 0;
    let lastHref: string | null = null;
    let savedCount = 0;

    for (const item of queue) {
      if (item.status === "done") continue;
      setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, status: "reading", error: undefined } : i)));

      const fd = new FormData();
      fd.set("file", item.file);
      const ing = await ingestDocument(fd);
      if (!ing.ok) {
        failures += 1;
        setQueue((q) =>
          q.map((i) => (i.id === item.id ? { ...i, status: "error", error: ing.error } : i)),
        );
        continue;
      }

      setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, status: "saving" } : i)));
      const payload = confirmPayloadFromExtract(ing.extracted, {
        filePath: ing.filePath,
        fileSha256: ing.fileSha256,
      }, chantiers, {
        lockKind,
        lockDirection,
        defaultChantierId,
      });

      const saved = await confirmDocument({
        ...payload,
        rawExtract: ing.extracted,
        agentMeta: ing.agent ?? null,
        readRecap: ing.recap ?? null,
      });

      if (!saved.ok) {
        failures += 1;
        setQueue((q) =>
          q.map((i) =>
            i.id === item.id
              ? { ...i, status: "error", error: "error" in saved ? saved.error : "Enregistrement impossible." }
              : i,
          ),
        );
        continue;
      }

      savedCount += 1;
      lastHref = hrefAfterDocumentSave({
        id: saved.id,
        chantierSlug: saved.chantierSlug,
      });
      setQueue((q) => q.map((i) => (i.id === item.id ? { ...i, status: "done" } : i)));
    }

    setRunning(false);
    router.refresh();
      if (failures === 0 && savedCount > 0) {
      setQueue([]);
      // Un fichier → fiche pièce (modifiable) ; plusieurs → liste métier.
      if (savedCount === 1 && lastHref) {
        router.replace(lastHref);
      } else {
        router.replace(pieceListHref(lockDirection ?? "in", lockKind ?? "devis"));
      }
    } else if (failures > 0) {
      setGlobalError(`${failures} fichier(s) en erreur — corrigez ou retirez-les puis relancez.`);
    }
  }

  const pendingCount = queue.filter((i) => i.status === "pending" || i.status === "error").length;
  const doneCount = queue.filter((i) => i.status === "done").length;

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          addFiles(e.dataTransfer.files);
        }}
        disabled={running}
        className={cn(
          "relative flex w-full flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed px-4 text-center transition-[border-color,background-color] duration-200",
          compact ? "min-h-[140px] py-5" : "min-h-[160px] py-7",
          over ? "border-brand-orange bg-wash-orange" : "border-line bg-surface-2",
          running && "pointer-events-none opacity-70",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Files className="size-7 text-brand-orange" aria-hidden />
        <p className="font-display text-[16px] font-semibold tracking-tight text-ink">
          Import en masse
        </p>
        <p className="max-w-[36ch] text-[12.5px] leading-snug text-muted-foreground">
          Jusqu’à {MAX_FILES} fichiers. Lecture puis enregistrement automatique avec les totaux détectés.
        </p>
        <span className="mt-0.5 inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] text-muted-foreground">
          <Upload className="size-3" aria-hidden />
          PDF · JPEG · PNG · HEIC
        </span>
      </button>

      {queue.length ? (
        <div className="rounded-card border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2.5">
            <p className="text-[13px] font-medium text-ink">
              {doneCount}/{queue.length} enregistré{doneCount > 1 ? "s" : ""}
              {running ? (
                <Loader2 className="ml-2 inline size-3.5 animate-spin text-brand-orange" aria-hidden />
              ) : null}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="h-8 rounded-full bg-[#FF6B1A] text-white hover:bg-[#e85f12]"
                disabled={running || !pendingCount}
                onClick={() => void runQueue()}
              >
                {running ? "Traitement…" : `Lancer (${pendingCount})`}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 rounded-full"
                disabled={running}
                onClick={() => setQueue([])}
              >
                Vider
              </Button>
            </div>
          </div>
          <ul className="max-h-[220px] overflow-y-auto divide-y divide-line">
            {queue.map((item) => (
              <li key={item.id} className="flex items-center gap-2 px-3 py-2 text-[12.5px]">
                {item.status === "done" ? (
                  <CheckCircle2 className="size-4 shrink-0 text-brand-orange" aria-hidden />
                ) : item.status === "error" ? (
                  <XCircle className="size-4 shrink-0 text-destructive" aria-hidden />
                ) : item.status === "reading" || item.status === "saving" ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
                ) : (
                  <span className="size-4 shrink-0 rounded-full border border-line" aria-hidden />
                )}
                <span className="min-w-0 flex-1 truncate text-ink">{item.file.name}</span>
                <span className="shrink-0 text-muted-foreground">
                  {item.status === "reading"
                    ? "Lecture…"
                    : item.status === "saving"
                      ? "Enregistrement…"
                      : item.status === "error"
                        ? "Erreur"
                        : item.status === "done"
                          ? "OK"
                          : "En attente"}
                </span>
                {!running && item.status !== "done" ? (
                  <button
                    type="button"
                    className="shrink-0 text-[11px] text-muted-foreground underline-offset-2 hover:text-ink hover:underline"
                    onClick={() => removeItem(item.id)}
                  >
                    Retirer
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          {globalError ? (
            <p role="alert" className="border-t border-line px-3 py-2 text-[12.5px] text-destructive">
              {globalError}
            </p>
          ) : null}
          {queue.some((i) => i.error) ? (
            <ul className="border-t border-line px-3 py-2 text-[11.5px] text-muted-foreground">
              {queue
                .filter((i) => i.error)
                .slice(0, 3)
                .map((i) => (
                  <li key={i.id} className="truncate">
                    {i.file.name} — {i.error}
                  </li>
                ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
