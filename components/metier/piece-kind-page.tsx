import Link from "next/link";
import { DevisTemplates } from "@/components/metier/devis-templates";
import { DocFilters } from "@/components/metier/doc-filters";
import { DocumentBrowser } from "@/components/metier/document-browser";
import { DocumentDrop } from "@/components/metier/document-drop";
import { PageHead } from "@/components/shell/page-head";
import { getCompanyProfile, listChantiers, listDocuments, listParties } from "@/lib/metier/queries";
import type { DocDirection, DocKind } from "@/lib/metier/types";
import type { TarineoHdMascotName } from "@/components/tarineo-hd-mascot";
import { R } from "@/lib/routes";

export async function PieceKindPage({
  direction,
  kind,
  base,
  label,
  title,
  text,
  empty,
  dropHint,
  mascot = "09-devis-valide",
  ornament = "none",
  showTemplates,
  chantierSlug,
  partyId,
}: {
  direction: DocDirection;
  kind: DocKind;
  base: string;
  label: string;
  title: string;
  /** @deprecated */
  tail?: string;
  text: string;
  empty: string;
  dropHint: string;
  mascot?: TarineoHdMascotName;
  ornament?: "mascot" | "mark" | "none";
  showTemplates?: boolean;
  chantierSlug?: string | null;
  partyId?: string | null;
}) {
  const [docs, clients, chantiers, dists, company, allDocs] = await Promise.all([
    listDocuments({ direction, kind }),
    listParties("client"),
    listChantiers(),
    listParties("distributeur"),
    getCompanyProfile(),
    listDocuments(),
  ]);
  const chantier = chantiers.find((c) => c.slug === chantierSlug);
  const filtered = docs.filter((d) => {
    if (chantier && d.chantier_id !== chantier.id) return false;
    if (partyId && d.party_id !== partyId) return false;
    return true;
  });
  const outbound = direction === "in" ? allDocs.filter((d) => d.direction === "out") : allDocs;
  const parent = direction === "in" ? "Documents distributeur" : "Documents entreprise";
  const ctaLabel = direction === "out" && kind === "devis" ? "Nouveau devis" : "Importer un document";

  return (
    <section className="flex flex-col gap-6">
      <PageHead
        mascot={mascot}
        ornament={ornament}
        label={label}
        title={title}
        crumbs={[
          { href: "/accueil", label: "Accueil" },
          { label: parent },
          { label: title },
        ]}
        action={
          <Link
            href="#import"
            className="btn-orange inline-flex h-11 items-center rounded-[12px] px-4 text-[13.5px] font-medium md:h-9 md:rounded-[10px]"
          >
            {ctaLabel}
          </Link>
        }
      >
        {text}
      </PageHead>
      <DocFilters
        base={base}
        chantiers={chantiers}
        parties={direction === "in" ? dists : undefined}
        chantier={chantierSlug ?? null}
        party={partyId ?? null}
      />
      {showTemplates ? <DevisTemplates chantiers={chantiers} clients={clients} /> : null}
      <DocumentDrop
        chantiers={chantiers}
        clients={clients}
        lockKind={kind}
        lockDirection={direction}
        hint={dropHint}
        defaultChantierId={chantier?.id}
      />
      <DocumentBrowser
        docs={filtered}
        direction={direction}
        allDocs={outbound}
        empty={empty}
        emptyHref={direction === "out" ? `${R.clientDevis}#import` : `${R.distributeurDevis}#import`}
        emptyAction={ctaLabel}
        company={company}
        transformedSourceIds={
          direction === "in"
            ? outbound.map((d) => d.source_document_id).filter((id): id is string => Boolean(id))
            : undefined
        }
      />
    </section>
  );
}
