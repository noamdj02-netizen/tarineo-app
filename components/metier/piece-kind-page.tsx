import Link from "next/link";
import { DevisTemplates } from "@/components/metier/devis-templates";
import { DocFilters } from "@/components/metier/doc-filters";
import { DocumentBrowser } from "@/components/metier/document-browser";
import { DocumentDrop } from "@/components/metier/document-drop";
import { PageHead } from "@/components/shell/page-head";
import { getCompanyProfile, listChantiers, listDocuments, listParties } from "@/lib/metier/queries";
import type { DocDirection, DocKind } from "@/lib/metier/types";
import type { TarineoHdMascotName } from "@/components/tarineo-hd-mascot";
import { DevisInsights } from "@/components/tarineo/panels/devis-insights";
import { buildFollowUpViews } from "@/lib/metier/follow-ups";
import { listStoredFollowUps } from "@/lib/metier/follow-up-queries";
import { rankingRows } from "@/lib/metier/queries";
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
  const isClientDevis = direction === "out" && kind === "devis";
  const [docs, clients, chantiers, dists, company, allDocs, ranking, storedFollowUps] = await Promise.all([
    listDocuments({ direction, kind }),
    listParties("client"),
    listChantiers(),
    listParties("distributeur"),
    getCompanyProfile(),
    listDocuments(),
    isClientDevis ? rankingRows() : Promise.resolve({ articles: [], enseignes: [] }),
    isClientDevis ? listStoredFollowUps() : Promise.resolve([]),
  ]);
  const chantier = chantiers.find((c) => c.slug === chantierSlug);
  const filtered = docs.filter((d) => {
    if (chantier && d.chantier_id !== chantier.id) return false;
    if (partyId && d.party_id !== partyId) return false;
    return true;
  });
  const outbound = direction === "in" ? allDocs.filter((d) => d.direction === "out") : allDocs;
  const parent = direction === "in" ? "Documents fournisseur" : "Documents entreprise";
  const ctaLabel = isClientDevis ? "+ Nouveau devis" : "Importer un document";
  const ctaHref = isClientDevis ? R.devisNouveau : "#import";
  const importHref = isClientDevis ? R.devisAnalyser : null;
  const emptyAction = isClientDevis ? "Nouveau devis" : "Importer un document";
  const emptyHref = isClientDevis
    ? R.devisNouveau
    : direction === "out"
      ? `${R.clientDevis}#import`
      : `${R.distributeurDevis}#import`;

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
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={ctaHref}
              className="btn-orange inline-flex h-11 items-center rounded-[12px] px-4 text-[13.5px] font-medium md:h-9 md:rounded-[10px]"
            >
              {ctaLabel}
            </Link>
            {importHref ? (
              <Link
                href={importHref}
                className="inline-flex h-11 items-center rounded-[12px] border border-line bg-surface px-4 text-[13.5px] font-medium text-ink transition hover:bg-muted md:h-9 md:rounded-[10px]"
              >
                Importer un devis
              </Link>
            ) : null}
          </div>
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
      {isClientDevis ? (
        <DevisInsights
          outbound={allDocs.filter((d) => d.direction === "out")}
          followUps={buildFollowUpViews(allDocs, storedFollowUps)}
          articles={ranking.articles}
          sourceDoc={allDocs.find((d) => d.direction === "in" && d.kind === "devis") ?? null}
        />
      ) : null}
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
        emptyHref={emptyHref}
        emptyAction={emptyAction}
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
