import { DocFilters } from "@/components/metier/doc-filters";
import { DocumentDrop } from "@/components/metier/document-drop";
import { DocumentKindNav } from "@/components/metier/document-kind-nav";
import { DocumentList } from "@/components/metier/document-list";
import { PageHead } from "@/components/shell/page-head";
import { getCompanyProfile, listChantiers, listDocuments, listParties } from "@/lib/metier/queries";
import { KIND_LABEL, parseDocKind } from "@/lib/metier/types";
import { APP_PAGES } from "@/lib/site/app-pages";

export const metadata = { title: "Documents distributeur" };

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; chantier?: string; party?: string }>;
}) {
  const { kind: raw, chantier: chantierSlug, party } = await searchParams;
  const kind = parseDocKind(raw);
  const [chantiers, docs, outbound, clients, dists, company] = await Promise.all([
    listChantiers(),
    listDocuments({ direction: "in", kind: kind ?? undefined }),
    listDocuments({ direction: "out" }),
    listParties("client"),
    listParties("distributeur"),
    getCompanyProfile(),
  ]);
  const chantier = chantiers.find((c) => c.slug === chantierSlug);
  const filtered = docs.filter((d) => {
    if (chantier && d.chantier_id !== chantier.id) return false;
    if (party && d.party_id !== party) return false;
    return true;
  });
  const extra = new URLSearchParams();
  if (kind) extra.set("kind", kind);
  const p = APP_PAGES.documents;
  const label = kind ? KIND_LABEL[kind] : p.title;
  return (
    <section className="flex flex-col gap-8">
      <PageHead mascot="09-devis-valide" label="Distributeur" title={label} tail={kind ? "pièce d’achat." : p.tail}>
        {p.text}
      </PageHead>
      <DocumentKindNav
        base="/ressources"
        active={kind}
        items={[
          { kind: null, label: "Tout" },
          { kind: "devis", label: "Devis" },
          { kind: "bon_commande", label: "Bon de commande" },
          { kind: "bon_enlevement", label: "Enlèvement" },
          { kind: "facture", label: "Facture" },
        ]}
      />
      <DocFilters
        base="/ressources"
        extra={extra.toString()}
        chantiers={chantiers}
        parties={dists}
        chantier={chantierSlug ?? null}
        party={party ?? null}
      />
      <DocumentDrop chantiers={chantiers} clients={clients} defaultChantierId={chantier?.id} />
      <div>
        <p className="mono-label mb-3">{"/ À traiter ///"}</p>
        <DocumentList
          docs={filtered}
          empty="Aucun document. Glissez un devis distributeur ci-dessus."
          clients={clients}
          defaultMarginPct={company?.marge_par_defaut_pct}
          transformedSourceIds={outbound.map((d) => d.source_document_id).filter((id): id is string => Boolean(id))}
        />
      </div>
    </section>
  );
}
