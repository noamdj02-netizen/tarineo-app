import Link from "next/link";
import { LABELS_TYPE_PLURIEL, TYPES_FILTRABLES } from "@/lib/documentLabels";
import { features } from "@/lib/features";
import { lienDocumentsType } from "@/lib/typeDocumentQuery";
import type { DocumentType } from "@prisma/client";

const classeOnglet = (actif: boolean) =>
  `-mb-px shrink-0 whitespace-nowrap border-b-2 py-2.5 text-sm font-medium transition-colors ${
    actif ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
  }`;

const TYPES_V1: DocumentType[] = features.purchaseOrders
  ? [...TYPES_FILTRABLES]
  : (["DEVIS", "FACTURE"] as DocumentType[]);

export function NavTypeMobile({
  typeActif,
  comptes,
}: {
  typeActif?: DocumentType;
  comptes: Partial<Record<DocumentType, number>>;
}) {
  return (
    <nav
      aria-label="Filtrer par type de document"
      className="-mx-1 mb-5 flex gap-5 overflow-x-auto border-b border-[#EEE] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <Link href="/documents" aria-current={!typeActif ? "page" : undefined} className={classeOnglet(!typeActif)}>
        Tous
      </Link>
      {TYPES_V1.map((t) => (
        <Link
          key={t}
          href={lienDocumentsType(t)}
          aria-current={typeActif === t ? "page" : undefined}
          className={classeOnglet(typeActif === t)}
        >
          {LABELS_TYPE_PLURIEL[t]} ({comptes[t] ?? 0})
        </Link>
      ))}
    </nav>
  );
}
