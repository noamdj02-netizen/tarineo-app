import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChantierFiche } from "@/components/metier/chantier-fiche";
import { getChantier, getCompanyProfile, listChantiers, listParties } from "@/lib/metier/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chantier = await getChantier(slug);
  return { title: chantier?.name ?? "Chantier" };
}

export default async function ChantierPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chantier = await getChantier(slug);
  if (!chantier) notFound();
  const [clients, company, chantiers] = await Promise.all([
    listParties("client"),
    getCompanyProfile(),
    listChantiers(),
  ]);
  return (
    <section className="mx-auto w-full max-w-[880px]">
      <Link
        href="/projets"
        className="mb-4 inline-flex min-h-11 items-center gap-2 font-mono text-[11px] font-medium tracking-[0.1em] text-muted-foreground uppercase hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Tous les chantiers
      </Link>
      <ChantierFiche
        chantier={chantier}
        documents={chantier.documents}
        clients={clients}
        chantiers={chantiers}
        defaultMarginPct={company?.marge_par_defaut_pct}
      />
    </section>
  );
}
