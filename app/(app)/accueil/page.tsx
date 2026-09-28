import { HomeDashboard } from "@/components/home/home-dashboard";
import { buildFollowUpViews, documentSentAt } from "@/lib/metier/follow-ups";
import { listStoredFollowUps } from "@/lib/metier/follow-up-queries";
import { listAlerts, listChantiers, listDocuments, listParties, rankingRows, spendByMonth } from "@/lib/metier/queries";
import { getViewer } from "@/lib/session";
import { siteMetadata } from "@/lib/seo";

export const metadata = {
  title: "Tableau de bord",
  ...siteMetadata({ title: "Tableau de bord", path: "/accueil", noIndex: true }),
};

export default async function AccueilPage() {
  const [viewer, chantiers, clients, inbound, outbound, alerts, ranking, stored] = await Promise.all([
    getViewer(),
    listChantiers(),
    listParties("client"),
    listDocuments({ direction: "in" }),
    listDocuments({ direction: "out" }),
    listAlerts(),
    rankingRows(),
    listStoredFollowUps(),
  ]);
  const pending = inbound.filter((d) => !outbound.some((o) => o.source_document_id === d.id));
  const nextKinds = new Set(
    outbound.filter((d) => d.kind === "bon_commande" || d.kind === "facture").map((d) => d.source_document_id),
  );
  const devisAEnvoyer = outbound.filter(
    (d) => d.kind === "devis" && !nextKinds.has(d.id) && !documentSentAt(d.extract),
  );
  const facturesClient = outbound.filter((d) => d.kind === "facture");
  const allDocs = [...inbound, ...outbound];
  const followUps = buildFollowUpViews(allDocs, stored);
  const relancesDue = followUps.filter((f) => f.status === "due");

  return (
    <HomeDashboard
      firstName={viewer?.firstName}
      chantiers={chantiers}
      clients={clients}
      pendingDocs={pending}
      devisAEnvoyer={devisAEnvoyer}
      facturesClient={facturesClient.length}
      relancesDue={relancesDue}
      followUps={followUps}
      alerts={alerts}
      months={spendByMonth(inbound)}
      enseignes={ranking.enseignes}
      documents={allDocs}
    />
  );
}
