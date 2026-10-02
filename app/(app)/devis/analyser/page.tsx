import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DocumentAnalyseAgent } from "@/components/metier/document-analyse-agent";
import { listChantiers, listParties } from "@/lib/metier/queries";
import { R } from "@/lib/routes";

export const metadata = { title: "Analyse IA · documents" };

type Props = { searchParams: Promise<{ mode?: string }> };

export default async function DevisAnalyserPage({ searchParams }: Props) {
  const { mode } = await searchParams;
  if (mode === "voice" || mode === "manual") {
    redirect(`${R.devisNouveau}?mode=${mode}`);
  }
  if (mode === "document") {
    redirect(R.devisAnalyser);
  }

  const [chantiers, clients] = await Promise.all([listChantiers(), listParties("client")]);
  return (
    <Suspense fallback={<div className="text-[14px] text-muted-foreground">Chargement…</div>}>
      <DocumentAnalyseAgent chantiers={chantiers} clients={clients} />
    </Suspense>
  );
}
