import { DevisTemplates } from "@/components/metier/devis-templates";
import { DocFilters } from "@/components/metier/doc-filters";
import { DocumentDrop } from "@/components/metier/document-drop";
import { DocumentList } from "@/components/metier/document-list";
import { PageHead } from "@/components/shell/page-head";
import { getCompanyProfile, listChantiers, listDocuments, listParties } from "@/lib/metier/queries";
import type { DocDirection, DocKind } from "@/lib/metier/types";
import type { TarineoHdMascotName } from "@/components/tarineo-hd-mascot";

export async function PieceKindPage({
  direction,
  kind,
  base,
  label,
  title,
  tail,
  text,
  empty,
  dropHint,
  mascot = "09-devis-valide",
  showTemplates,
  chantierSlug,
  partyId,
}: {
  direction: DocDirection;
  kind: DocKind;
  base: string;
  label: string;
  title: string;
  tail: string;
  text: string;
  empty: string;
  dropHint: string;
  mascot?: TarineoHdMascotName;
  showTemplates?: boolean;
  chantierSlug?: string | null;
  partyId?: string | null;
}) {
  const [docs, clients, chantiers, dists, company] = await Promise.all([
    listDocuments({ direction, kind }),
    listParties("client"),
    listChantiers(),
    listParties("distributeur"),
    getCompanyProfile(),
  ]);
  const chantier = chantiers.find((c) => c.slug === chantierSlug);
  const filtered = docs.filter((d) => {
    if (chantier && d.chantier_id !== chantier.id) return false;
    if (partyId && d.party_id !== partyId) return false;
    return true;
  });
  const outbound = direction === "in" ? await listDocuments({ direction: "out" }) : [];

  return (
    <section className="flex flex-col gap-8">
      <PageHead mascot={mascot} label={label} title={title} tail={tail}>
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
      <DocumentList
        docs={filtered}
        empty={empty}
        company={company}
        clients={direction === "in" ? clients : undefined}
        defaultMarginPct={company?.marge_par_defaut_pct}
        transformedSourceIds={
          direction === "in"
            ? outbound.map((d) => d.source_document_id).filter((id): id is string => Boolean(id))
            : undefined
        }
      />
    </section>
  );
}
