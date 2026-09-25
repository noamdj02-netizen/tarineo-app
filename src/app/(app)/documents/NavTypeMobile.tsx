import Link from "next/link";
import { LABELS_TYPE_PLURIEL, ROUTES_DOCUMENTS_PAR_TYPE, TYPES_FILTRABLES } from "@/lib/documentLabels";
import { LIBELLE_SECTION_DOCUMENT_DISTRIBUTEUR } from "@/lib/navigationApp";
import type { DocumentType } from "@prisma/client";

const classeOnglet = (actif: boolean) =>
  `-mb-px shrink-0 whitespace-nowrap border-b-2 py-2.5 text-sm font-medium transition-colors ${
    actif ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
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
    <div className="mb-5 lg:hidden">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {LIBELLE_SECTION_DOCUMENT_DISTRIBUTEUR}
      </p>
      <nav
        aria-label="Filtrer par type de document distributeur"
        className="-mx-1 flex gap-5 overflow-x-auto border-b border-[#EEE] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
      <Link href="/documents" aria-current={!typeActif ? "page" : undefined} className={classeOnglet(!typeActif)}>
        Tous
      </Link>
      {TYPES_FILTRABLES.map((t) => (
        <Link
          key={t}
          href={ROUTES_DOCUMENTS_PAR_TYPE[t]}
          aria-current={typeActif === t ? "page" : undefined}
          className={classeOnglet(typeActif === t)}
        >
          {LABELS_TYPE_PLURIEL[t]} ({comptes[t] ?? 0})
        </Link>
      ))}
      </nav>
    </div>
  );
}
