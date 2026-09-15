import Link from "next/link";
import { LABELS_TYPE_PLURIEL, TYPES_FILTRABLES } from "@/lib/documentLabels";
import type { DocumentType } from "@prisma/client";

const classeOnglet = (actif: boolean) =>
  `-mb-px shrink-0 whitespace-nowrap border-b-2 py-2 text-sm font-medium ${
    actif ? "border-accent text-accent" : "border-transparent text-muted"
  }`;

// Onglets horizontaux scrollables — équivalent tactile du sous-menu desktop
// (voir SousMenuDocuments dans AppShell.tsx) : un sous-menu imbriqué dans la sidebar
// ne fonctionne pas bien au clic tactile sur petit écran. Vient s'ajouter au dropdown
// "Type" du formulaire de recherche plus bas, qui reste inchangé — ces onglets sont un
// raccourci, pas un remplacement. Les liens réinitialisent volontairement les autres
// filtres (mois/distributeur/référence/hausse), comme le sous-menu desktop.
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
      className="-mx-4 mb-4 flex gap-5 overflow-x-auto border-b border-border px-4 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <Link href="/documents" aria-current={!typeActif ? "page" : undefined} className={classeOnglet(!typeActif)}>
        Tous
      </Link>
      {TYPES_FILTRABLES.map((t) => (
        <Link
          key={t}
          href={`/documents?type=${t}`}
          aria-current={typeActif === t ? "page" : undefined}
          className={classeOnglet(typeActif === t)}
        >
          {LABELS_TYPE_PLURIEL[t]} ({comptes[t] ?? 0})
        </Link>
      ))}
    </nav>
  );
}
