"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { filterPillClass } from "@/components/app-ui/filter-pills";
import { DocumentPreview } from "@/components/metier/document-preview";
import type { CompanyProfile } from "@/lib/metier/company";
import type { DocumentCard } from "@/lib/metier/types";

export function DocumentViewer({
  doc,
  company,
}: {
  doc: DocumentCard;
  company?: CompanyProfile | null;
}) {
  const hasFile = Boolean(doc.file_path);
  const [tab, setTab] = useState<"devis" | "source">("devis");
  const stamp = `${doc.title}-${doc.party_name}-${doc.lines.map((l) => `${l.label}${l.qty}${l.sell_price}${l.buy_price}`).join("|")}`;
  const srcPath =
    tab === "source" && hasFile
      ? `/api/metier/documents/${doc.id}/fichier`
      : `/api/metier/documents/${doc.id}/pdf`;

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    setLoading(true);
    setError(null);
    setBlobUrl(null);

    (async () => {
      try {
        const res = await fetch(srcPath, { credentials: "same-origin", cache: "no-store" });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text.slice(0, 180) || `Erreur ${res.status}`);
        }
        const type = res.headers.get("content-type") || "";
        if (!type.includes("pdf") && !type.includes("image")) {
          const text = await res.text().catch(() => "");
          throw new Error(text.slice(0, 180) || "Réponse non PDF");
        }
        const blob = await res.blob();
        if (blob.size < 8) throw new Error("Fichier vide");
        objectUrl = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setBlobUrl(objectUrl);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Impossible d’afficher le PDF.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [srcPath, stamp]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setTab("devis")} className={filterPillClass(tab === "devis")}>
          Devis PDF
        </button>
        {hasFile ? (
          <button type="button" onClick={() => setTab("source")} className={filterPillClass(tab === "source")}>
            Fichier déposé
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="flex h-[min(480px,60vh)] items-center justify-center rounded-[8px] border border-line bg-[#525659] text-white/80">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          <span className="ml-2 text-[13px]">Chargement du PDF…</span>
        </div>
      ) : null}

      {!loading && blobUrl ? (
        <iframe
          key={blobUrl}
          title={doc.title}
          src={blobUrl}
          className="h-[min(1100px,88vh)] w-full rounded-[8px] border border-line bg-[#525659]"
        />
      ) : null}

      {!loading && error ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2 rounded-[12px] border border-warning/35 bg-wash-amber px-3.5 py-3 text-[13px] text-wash-amber-ink">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div>
              <p className="font-medium">Aperçu PDF indisponible</p>
              <p className="mt-0.5 opacity-90">{error}</p>
              <a
                href={`/api/metier/documents/${doc.id}/pdf?dl=1`}
                className="mt-2 inline-flex font-medium underline underline-offset-2"
              >
                Forcer le téléchargement
              </a>
            </div>
          </div>
          {tab === "devis" ? (
            <div className="overflow-hidden rounded-[12px] border border-line bg-wash-paper p-4">
              <DocumentPreview doc={doc} company={company} size="full" />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
