import { DocFilters } from "@/components/metier/doc-filters";
import { DocumentDrop } from "@/components/metier/document-drop";
import { DocumentKindNav } from "@/components/metier/document-kind-nav";
import { DocumentList } from "@/components/metier/document-list";
import { PageHead } from "@/components/shell/page-head";
import { getCompanyProfile, listChantiers, listDocuments, listParties } from "@/lib/metier/queries";
import { CLIENT_OUT_LABEL, parseDocKind } from "@/lib/metier/types";
import { APP_PAGES } from "@/lib/site/app-pages";

export const metadata = { title: "Documents entreprise" };

export default async function DevisPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; chantier?: string }>;
}) {
  const { kind: raw, chantier: chantierSlug } = await searchParams;
  const kind = parseDocKind(raw);
  const [out, inbound, clients, chantiers, company] = await Promise.all([
    listDocuments({ direction: "out", kind: kind ?? undefined }),
    listDocuments({ direction: "in" }),
    listParties("client"),
    listChantiers(),
    getCompanyProfile(),
  ]);
  const chantier = chantiers.find((c) => c.slug === chantierSlug);
  const filterSlug = chantier?.slug;
  const outF = filterSlug ? out.filter((d) => d.chantier_slug === filterSlug) : out;
  const inF = filterSlug ? inbound.filter((d) => d.chantier_slug === filterSlug) : inbound;
  const extra = new URLSearchParams();
  if (kind) extra.set("kind", kind);
  const p = APP_PAGES.devis;
  const title = kind && kind in CLIENT_OUT_LABEL ? CLIENT_OUT_LABEL[kind as keyof typeof CLIENT_OUT_LABEL] : p.title;
  return (
    <section className="flex flex-col gap-8">
      <PageHead mascot="09-devis-valide" label="Entreprise" title={title} tail={p.tail}>
        {p.text}
      </PageHead>
      <DocumentKindNav
        base="/composants"
        active={kind}
        items={[
          { kind: null, label: "Tout" },
          { kind: "devis", label: "Devis" },
          { kind: "bon_commande", label: "BC client" },
          { kind: "facture", label: "Facture" },
        ]}
      />
      <DocFilters base="/composants" extra={extra.toString()} chantiers={chantiers} chantier={chantierSlug ?? null} />
      <DocumentDrop chantiers={chantiers} clients={clients} defaultChantierId={chantier?.id} />
      <DocumentList docs={outF} empty="Pas encore de pièce client. Transformez un achat ci-dessous, puis envoyez le PDF." />
      <div>
        <p className="mono-label mb-3">{"/ Depuis un achat ///"}</p>
        <DocumentList
          docs={inF}
          empty="Aucun achat. Déposez un devis distributeur."
          clients={clients}
          defaultMarginPct={company?.marge_par_defaut_pct}
          transformedSourceIds={out.map((d) => d.source_document_id).filter((id): id is string => Boolean(id))}
        />
      </div>
    </section>
  );
}
