"use client";

import { FilterPills } from "@/components/app-ui/filter-pills";
import { DocumentList } from "@/components/metier/document-list";
import {
  documentSentAt,
  isDocumentTransformed,
} from "@/lib/metier/follow-ups";
import type { CompanyProfile } from "@/lib/metier/company";
import type { DocumentCard } from "@/lib/metier/types";
import { useMemo, useState } from "react";

type InFilter = "all" | "verify" | "done" | "linked";
type OutFilter = "all" | "draft" | "send" | "sent" | "transformed";

const IN_OPTS: { id: InFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "verify", label: "À vérifier" },
  { id: "done", label: "Traités" },
  { id: "linked", label: "Liés à un chantier" },
];

const OUT_OPTS: { id: OutFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "draft", label: "Brouillons" },
  { id: "send", label: "À envoyer" },
  { id: "sent", label: "Envoyés" },
  { id: "transformed", label: "Transformés" },
];

export function DocumentBrowser({
  docs,
  direction,
  allDocs,
  empty,
  emptyHref,
  emptyAction,
  company,
  transformedSourceIds,
}: {
  docs: DocumentCard[];
  direction: "in" | "out";
  allDocs: DocumentCard[];
  empty: string;
  emptyHref?: string;
  emptyAction?: string;
  company?: CompanyProfile | null;
  transformedSourceIds?: string[];
}) {
  const [inFilter, setInFilter] = useState<InFilter>("all");
  const [outFilter, setOutFilter] = useState<OutFilter>("all");

  const filtered = useMemo(() => {
    if (direction === "in") {
      return docs.filter((d) => {
        const transformed = Boolean(transformedSourceIds?.includes(d.id));
        if (inFilter === "verify") return !transformed;
        if (inFilter === "done") return transformed;
        if (inFilter === "linked") return Boolean(d.chantier_id);
        return true;
      });
    }
    return docs.filter((d) => {
      const sent = Boolean(documentSentAt(d.extract));
      const transformed = isDocumentTransformed(d, allDocs);
      const hasLines = d.lines.length > 0;
      if (outFilter === "draft") return !sent && !transformed && !hasLines;
      if (outFilter === "send") return !sent && !transformed && hasLines;
      if (outFilter === "sent") return sent && !transformed;
      if (outFilter === "transformed") return transformed;
      return true;
    });
  }, [docs, direction, inFilter, outFilter, transformedSourceIds, allDocs]);

  return (
    <div className="flex flex-col gap-4">
      {direction === "in" ? (
        <FilterPills value={inFilter} onChange={setInFilter} options={IN_OPTS} />
      ) : (
        <FilterPills value={outFilter} onChange={setOutFilter} options={OUT_OPTS} />
      )}
      <DocumentList
        docs={filtered}
        empty={empty}
        emptyHref={emptyHref}
        emptyAction={emptyAction}
        company={company}
        transformedSourceIds={transformedSourceIds}
      />
    </div>
  );
}
