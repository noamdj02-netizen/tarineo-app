import { Download } from "lucide-react";
import type { DocumentCard } from "@/lib/metier/types";

export function DocumentDownload({ doc }: { doc: DocumentCard }) {
  return (
    <a
      href={`/api/metier/documents/${doc.id}/pdf`}
      className="inline-flex h-8 items-center rounded-full border border-line px-3 text-[12.5px] font-medium hover:bg-surface-2"
    >
      <Download className="mr-1.5 size-3.5" aria-hidden />
      Télécharger
    </a>
  );
}
