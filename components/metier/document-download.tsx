"use client";

import { useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DocumentCard } from "@/lib/metier/types";

function zeroPriceCount(doc: DocumentCard) {
  if (doc.direction !== "out") return 0;
  return doc.lines.filter((l) => !(Number(l.sell_price) > 0)).length;
}

export function DocumentDownload({ doc }: { doc: DocumentCard }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const missing = useMemo(() => zeroPriceCount(doc), [doc]);

  async function download() {
    setPending(true);
    setError(null);
    setConfirmOpen(false);
    try {
      const res = await fetch(`/api/metier/documents/${doc.id}/pdf?dl=1`, {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text.slice(0, 120) || `Erreur ${res.status}`);
      }
      const blob = await res.blob();
      if (blob.size < 8 || blob.type.includes("text/plain")) {
        throw new Error("Le serveur n’a pas renvoyé un PDF valide.");
      }
      const cd = res.headers.get("content-disposition") || "";
      const match = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"/i.exec(cd);
      const name = decodeURIComponent(match?.[1] || match?.[2] || `${doc.title || "document"}.pdf`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name.endsWith(".pdf") ? name : `${name}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Téléchargement impossible.");
    } finally {
      setPending(false);
    }
  }

  function onClick() {
    if (missing > 0 && !confirmOpen) {
      setConfirmOpen(true);
      return;
    }
    void download();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {confirmOpen ? (
        <div className="max-w-[280px] rounded-xl border border-line bg-surface p-3 text-left shadow-soft">
          <p className="text-[13px] text-ink">
            Attention : {missing} ligne{missing > 1 ? "s" : ""} n’ont pas encore de prix.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => setConfirmOpen(false)}>
              Modifier
            </Button>
            <Button type="button" size="sm" className="rounded-full" disabled={pending} onClick={() => void download()}>
              Continuer malgré tout
            </Button>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex h-8 items-center rounded-full border border-line px-3 text-[12.5px] font-medium hover:bg-surface-2 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
        ) : (
          <Download className="mr-1.5 size-3.5" aria-hidden />
        )}
        {pending ? "PDF…" : "Télécharger"}
      </button>
      {error ? <p className="max-w-[220px] text-right text-[11px] text-destructive">{error}</p> : null}
    </div>
  );
}
