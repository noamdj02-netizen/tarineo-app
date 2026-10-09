import { notFound } from "next/navigation";
import Link from "next/link";
import { DocumentEdit } from "@/components/metier/document-edit";
import { DocumentSend } from "@/components/metier/document-send";
import { DocumentViewer } from "@/components/metier/document-viewer";
import { ConvertDevisActions } from "@/components/metier/convert-devis";
import { DocumentDownload } from "@/components/metier/document-download";
import { PieceChantierCta, PieceOrientationBanner } from "@/components/metier/piece-chantier-cta";
import { RelanceButton, RelanceStatus } from "@/components/metier/relance-dialog";
import { TransformForm } from "@/components/metier/transform-form";
import { MetricStrip } from "@/components/app-ui/metric-strip";
import { PageHeader } from "@/components/app-ui/page-header";
import { SectionHeader } from "@/components/app-ui/section-header";
import { StatusBadge } from "@/components/tarineo/status-badge";
import { DocumentChain } from "@/components/metier/document-chain";
import { documentDeliveryDate, formatDeliveryDateFr } from "@/lib/metier/delivery";
import { documentAmountHt, documentChains, documentLifecycleLabel, buildFollowUpViews } from "@/lib/metier/follow-ups";
import { listStoredFollowUps } from "@/lib/metier/follow-up-queries";
import { getCompanyProfile, getDocument, listChantiers, listDocuments, listParties } from "@/lib/metier/queries";
import { pieceListHref, R } from "@/lib/routes";
import { KIND_LABEL } from "@/lib/metier/types";
import { euro } from "@/lib/site/tarineo";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDocument(id);
  return { title: doc?.title ?? "Pièce" };
}

export default async function PiecePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc) notFound();
  const [clients, dists, chantiers, company, all, stored] = await Promise.all([
    listParties("client"),
    listParties("distributeur"),
    listChantiers(),
    getCompanyProfile(),
    listDocuments(),
    listStoredFollowUps(),
  ]);
  const back = pieceListHref(doc.direction, doc.kind);
  const parties = doc.direction === "out" ? clients : dists;
  const ht = documentAmountHt(doc);
  const followUp = buildFollowUpViews(all, stored).find((f) => f.document_id === doc.id);
  const chain = documentChains(all).find((c) => c.some((d) => d.id === doc.id)) ?? [];
  const lifecycle = documentLifecycleLabel(doc, all);
  const partyLabel = doc.direction === "out" ? "Client" : "Fournisseur";
  const deliveryDay = documentDeliveryDate(doc);

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        crumbs={[
          { href: "/accueil", label: "Accueil" },
          { href: back, label: KIND_LABEL[doc.kind] },
          { label: doc.title },
        ]}
        title={doc.title}
        description={
          doc.chantier_name
            ? `${KIND_LABEL[doc.kind]} · chantier ${doc.chantier_name}`
            : `${KIND_LABEL[doc.kind]} · pas encore lié à un chantier`
        }
        action={
          <div className="flex flex-wrap items-start gap-2">
            <PieceChantierCta
              documentId={doc.id}
              chantierSlug={doc.chantier_slug}
              chantierName={doc.chantier_name}
            />
            <DocumentDownload doc={doc} />
            {doc.direction === "in" ? (
              <Link
                href={`${R.comparateur}?a=${doc.id}`}
                className="inline-flex h-9 items-center rounded-[10px] border border-line bg-surface px-3 text-[13px]"
              >
                Comparer
              </Link>
            ) : null}
          </div>
        }
      />

      <PieceOrientationBanner
        documentId={doc.id}
        hasChantier={Boolean(doc.chantier_id)}
        kindLabel={KIND_LABEL[doc.kind]}
      />

      <MetricStrip
        items={[
          {
            label: partyLabel,
            value: doc.party_name ?? "—",
          },
          {
            label: "Chantier",
            value: doc.chantier_name ?? "Non lié",
          },
          {
            label: "Montant HT",
            value: ht ? euro(ht) : "—",
          },
          {
            label: "Livraison",
            value: deliveryDay ? formatDeliveryDateFr(deliveryDay) : "—",
          },
          {
            label: "Statut",
            value: lifecycle,
          },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge
          label={lifecycle}
          tone={lifecycle.includes("Envoy") || lifecycle.includes("Factur") ? "ok" : "muted"}
        />
      </div>

      {followUp ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-soft">
          <RelanceStatus followUp={followUp} />
          <RelanceButton doc={doc} followUp={followUp} />
        </div>
      ) : doc.status === "ready" && !all.some((d) => d.source_document_id === doc.id) ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-soft">
          <p className="text-[13.5px] text-muted-foreground">Relance</p>
          <RelanceButton doc={doc} />
        </div>
      ) : null}

      {chain.length > 1 ? (
        <div>
          <SectionHeader title="Historique" className="mb-3" />
          <DocumentChain chain={chain} />
        </div>
      ) : null}

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <SectionHeader title="Aperçu" className="mb-3" />
          <DocumentViewer doc={doc} company={company} />
        </div>
        <aside className="flex flex-col gap-6">
          <div className="rounded-card border border-line bg-surface p-4 shadow-soft">
            <SectionHeader title="Informations" className="mb-3" />
            <DocumentEdit doc={doc} chantiers={chantiers} parties={parties} />
          </div>
          <DocumentSend doc={doc} />
          {doc.direction === "in" ? (
            <TransformForm
              source={doc}
              clients={clients}
              defaultClientId={doc.party_kind === "client" ? doc.party_id : clients[0]?.id ?? null}
              defaultMarginPct={company?.marge_par_defaut_pct}
            />
          ) : null}
          {doc.direction === "out" && (doc.kind === "devis" || doc.kind === "bon_commande") ? (
            <ConvertDevisActions
              sourceId={doc.id}
              sourceKind={doc.kind}
              size="form"
              className="rounded-card border border-line bg-surface-2 p-4"
            />
          ) : null}
        </aside>
      </div>
    </section>
  );
}
