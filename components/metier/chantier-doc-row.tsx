"use client";

import Link from "next/link";
import { Download, FilePenLine, FileText, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { RelanceButton } from "@/components/metier/relance-dialog";
import { StatusBadge } from "@/components/tarineo/status-badge";
import { documentAmountHt, documentLifecycleLabel, type FollowUpView } from "@/lib/metier/follow-ups";
import { R } from "@/lib/routes";
import type { DocumentCard } from "@/lib/metier/types";
import { euro } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

function lifecycleTone(label: string): "ok" | "muted" | "warn" {
  if (label === "Prêt" || label === "Facturé" || label === "Commande créée" || label === "Lié") return "ok";
  if (label === "Envoyé" || label === "Envoyée" || label === "Facturée") return "ok";
  return "muted";
}

const BTN =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[12.5px] font-medium text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-orange/35 disabled:opacity-50 md:min-h-9 md:min-w-0";

export function ChantierDocRow({
  doc,
  all,
  followUp,
  inbound,
}: {
  doc: DocumentCard;
  all: DocumentCard[];
  followUp?: FollowUpView | null;
  inbound?: boolean;
}) {
  const [pdfPending, setPdfPending] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const life = documentLifecycleLabel(doc, all);
  const ht = documentAmountHt(doc);
  const canRelance =
    doc.direction === "out" &&
    (doc.kind === "devis" || doc.kind === "bon_commande") &&
    followUp?.status !== "answered" &&
    followUp?.status !== "done" &&
    followUp?.status !== "cancelled";
  const canEdit = doc.direction === "out" || doc.status === "ready";

  async function downloadPdf() {
    setPdfPending(true);
    setPdfError(null);
    try {
      const res = await fetch(`/api/metier/documents/${doc.id}/pdf?dl=1`, {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Téléchargement impossible");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.title || "document"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setPdfError("PDF indisponible");
    } finally {
      setPdfPending(false);
    }
  }

  return (
    <li
      className={cn(
        "rounded-[14px] border px-3 py-3 sm:px-4",
        inbound
          ? "border-brand-orange/20 bg-wash-orange-strong"
          : "border-line bg-surface",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={R.piece(doc.id)}
          className="flex min-w-0 flex-1 items-start gap-2.5 rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-nav-orange/35"
        >
          <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.6} aria-hidden />
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink hover:underline">{doc.title}</span>
            <span className="mt-1 flex flex-wrap items-center gap-2">
              <StatusBadge label={life} tone={lifecycleTone(life)} />
              {doc.party_name ? (
                <span className="truncate text-[12.5px] text-muted-foreground">{doc.party_name}</span>
              ) : null}
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 sm:justify-end">
          <span className="tabular-nums text-[13.5px] text-muted-foreground sm:mr-1">
            {ht ? `${euro(ht)} HT` : "—"}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              className={BTN}
              disabled={pdfPending}
              onClick={() => void downloadPdf()}
              aria-label={`Télécharger le PDF de ${doc.title}`}
            >
              <Download className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">{pdfPending ? "…" : "PDF"}</span>
            </button>
            {canEdit ? (
              <Link href={R.piece(doc.id)} className={BTN} aria-label={`Modifier ${doc.title}`}>
                <FilePenLine className="size-3.5" aria-hidden />
                <span className="hidden sm:inline">Modifier</span>
              </Link>
            ) : null}
            {canRelance ? <RelanceButton doc={doc} followUp={followUp} size="chip" /> : null}
            <div className="relative">
              <button
                type="button"
                className={BTN}
                aria-label="Plus d’actions"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <MoreHorizontal className="size-3.5" aria-hidden />
              </button>
              {menuOpen ? (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10 cursor-default"
                    aria-label="Fermer le menu"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-1 min-w-[10.5rem] rounded-xl border border-line bg-surface p-1 shadow-lift">
                    <Link
                      href={R.piece(doc.id)}
                      className="block rounded-lg px-3 py-2.5 text-[13px] hover:bg-surface-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      Ouvrir la fiche
                    </Link>
                    {doc.direction === "in" ? (
                      <Link
                        href={`${R.comparateur}?a=${doc.id}`}
                        className="block rounded-lg px-3 py-2.5 text-[13px] hover:bg-surface-2"
                        onClick={() => setMenuOpen(false)}
                      >
                        Comparer
                      </Link>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {pdfError ? <p className="mt-2 text-[12px] text-destructive">{pdfError}</p> : null}
    </li>
  );
}
