"use client";

import { useState } from "react";
import { filterPillClass } from "@/components/app-ui/filter-pills";
import type { DocumentCard } from "@/lib/metier/types";

export function DocumentViewer({ doc }: { doc: DocumentCard }) {
  const hasFile = Boolean(doc.file_path);
  const [tab, setTab] = useState<"devis" | "source">("devis");
  const stamp = `${doc.title}-${doc.party_name}-${doc.lines.map((l) => `${l.label}${l.qty}${l.sell_price}${l.buy_price}`).join("|")}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setTab("devis")} className={filterPillClass(tab === "devis")}>
          Devis
        </button>
        {hasFile ? (
          <button type="button" onClick={() => setTab("source")} className={filterPillClass(tab === "source")}>
            Fichier déposé
          </button>
        ) : null}
      </div>
      <iframe
        key={tab === "devis" ? stamp : `${doc.id}-src`}
        title={doc.title}
        src={tab === "source" && hasFile ? `/api/metier/documents/${doc.id}/fichier` : `/api/metier/documents/${doc.id}/pdf`}
        className="h-[min(1100px,88vh)] w-full rounded-[8px] border border-line bg-[#525659]"
      />
    </div>
  );
}
