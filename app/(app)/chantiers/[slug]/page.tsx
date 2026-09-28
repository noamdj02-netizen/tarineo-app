import { notFound } from "next/navigation";
import { ChantierFiche } from "@/components/metier/chantier-fiche";
import { buildFollowUpViews } from "@/lib/metier/follow-ups";
import { listStoredFollowUps } from "@/lib/metier/follow-up-queries";
import { getChantier, getCompanyProfile, listAlerts, listChantiers, listParties } from "@/lib/metier/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chantier = await getChantier(slug);
  return { title: chantier?.name ?? "Chantier" };
}

export default async function ChantierPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ slug }, { tab }] = await Promise.all([params, searchParams]);
  const chantier = await getChantier(slug);
  if (!chantier) notFound();
  const [clients, company, chantiers, alerts, stored] = await Promise.all([
    listParties("client"),
    getCompanyProfile(),
    listChantiers(),
    listAlerts(),
    listStoredFollowUps(),
  ]);
  const followUps = buildFollowUpViews(chantier.documents, stored).filter((f) => f.chantier_id === chantier.id);
  return (
    <section className="mx-auto w-full max-w-[960px]">
      <ChantierFiche
        chantier={chantier}
        documents={chantier.documents}
        clients={clients}
        chantiers={chantiers}
        defaultMarginPct={company?.marge_par_defaut_pct}
        alerts={alerts.filter((a) => a.chantier_id === chantier.id)}
        followUps={followUps}
        initialTab={tab}
      />
    </section>
  );
}
