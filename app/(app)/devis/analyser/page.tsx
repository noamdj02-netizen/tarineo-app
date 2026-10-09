import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DocumentAnalyseAgent } from "@/components/metier/document-analyse-agent";
import { listChantiers, listDocuments, listParties, listTransformedSourceIds } from "@/lib/metier/queries";
import { R } from "@/lib/routes";

export const metadata = { title: "Analyse IA · documents" };

type Props = { searchParams: Promise<{ mode?: string; film?: string }> };

export default async function DevisAnalyserPage({ searchParams }: Props) {
  const { mode, film } = await searchParams;
  if (mode === "voice" || mode === "manual") {
    redirect(`${R.devisNouveau}?mode=${mode}`);
  }
  if (mode === "document") {
    redirect(R.devisAnalyser);
  }

  const [chantiers, clients, inbound, transformedIds] = await Promise.all([
    listChantiers(),
    listParties("client"),
    listDocuments({ direction: "in", limit: 60 }),
    listTransformedSourceIds(),
  ]);
  const pendingTransform = inbound
    .filter((d) => d.status !== "error" && !transformedIds.has(d.id))
    .slice(0, 24);
  const recentDocs = inbound.filter((d) => d.status !== "error").slice(0, 8);
  const errorDocs = inbound.filter((d) => d.status === "error" || Boolean(d.error?.trim()));

  return (
    <Suspense fallback={<div className="text-[14px] text-muted-foreground">Chargement…</div>}>
      <DocumentAnalyseAgent
        chantiers={chantiers}
        clients={clients}
        pendingTransform={pendingTransform}
        recentDocs={recentDocs}
        errorDocs={errorDocs}
        filmLecture={film === "lecture"}
      />
    </Suspense>
  );
}
