import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentDownload } from "@/components/metier/document-download";
import { DocumentEdit } from "@/components/metier/document-edit";
import { DocumentSend } from "@/components/metier/document-send";
import { DocumentViewer } from "@/components/metier/document-viewer";
import { TransformForm } from "@/components/metier/transform-form";
import { getCompanyProfile, getDocument, listChantiers, listParties } from "@/lib/metier/queries";
import { pieceListHref, R } from "@/lib/routes";
import { KIND_LABEL } from "@/lib/metier/types";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDocument(id);
  return { title: doc?.title ?? "Pièce" };
}

export default async function PiecePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc) notFound();
  const [clients, dists, chantiers, company] = await Promise.all([
    listParties("client"),
    listParties("distributeur"),
    listChantiers(),
    getCompanyProfile(),
  ]);
  const back = pieceListHref(doc.direction, doc.kind);
  const parties = doc.direction === "out" ? clients : dists;
  return (
    <section className="flex flex-col gap-6">
      <Link
        href={back}
        className="inline-flex min-h-11 items-center gap-2 font-mono text-[11px] font-medium tracking-[0.1em] text-muted-foreground uppercase hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {KIND_LABEL[doc.kind]}
      </Link>
      <header className="flex flex-col gap-2">
        <p className="mono-label">{`/ ${KIND_LABEL[doc.kind]} ///`}</p>
        <h1 className="font-display text-[clamp(28px,5vw,40px)] font-semibold tracking-tightest">{doc.title}</h1>
        <p className="text-[15px] text-muted-foreground">
          {doc.party_name ?? (doc.direction === "out" ? "Sans client" : "Sans distributeur")}
          {doc.chantier_name ? ` · ${doc.chantier_name}` : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          <DocumentDownload doc={doc} />
          {doc.chantier_slug ? (
            <Link
              href={R.chantier(doc.chantier_slug)}
              className="inline-flex h-8 items-center rounded-full border border-line px-3 text-[12.5px]"
            >
              Chantier
            </Link>
          ) : null}
          {doc.direction === "in" ? (
            <Link
              href={`${R.comparateur}?a=${doc.id}`}
              className="inline-flex h-8 items-center rounded-full border border-line px-3 text-[12.5px]"
            >
              Comparer
            </Link>
          ) : null}
        </div>
      </header>

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <DocumentViewer doc={doc} />
        <aside className="flex flex-col gap-6">
          <div>
            <p className="mono-label mb-3">{"/ Modifier ///"}</p>
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
        </aside>
      </div>
    </section>
  );
}
