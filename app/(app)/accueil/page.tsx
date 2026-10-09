import { loadDashboardLayout } from "@/app/(app)/accueil/dashboard-actions";
import { HomeDashboard } from "@/components/home/home-dashboard";
import { getDb } from "@/lib/db";
import { emptyWeekStats, getWeekStats } from "@/lib/home/week";
import { buildFollowUpViews, documentSentAt } from "@/lib/metier/follow-ups";
import { listStoredFollowUps } from "@/lib/metier/follow-up-queries";
import {
  getCompanyProfile,
  listAlerts,
  listChantiers,
  listDocuments,
  listParties,
  rankingRows,
} from "@/lib/metier/queries";
import { getViewer } from "@/lib/session";
import { siteMetadata } from "@/lib/seo";

export const metadata = {
  title: "Tableau de bord",
  ...siteMetadata({ title: "Tableau de bord", path: "/accueil", noIndex: true }),
};

export default async function AccueilPage() {
  const [viewer, chantiers, clients, inbound, outbound, alerts, ranking, stored, company] =
    await Promise.all([
    getViewer(),
    listChantiers(),
    listParties("client"),
    listDocuments({ direction: "in" }),
    listDocuments({ direction: "out" }),
    listAlerts(),
    rankingRows(),
    listStoredFollowUps(),
    getCompanyProfile(),
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
  const recentPieces = allDocs
    .filter((d) => d.kind === "devis" || d.kind === "facture")
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 6);

  // Sync notifications opérationnelles (idempotent) — n’échoue jamais le dashboard
  try {
    const { syncOperationalNotifications } = await import("@/lib/notifications/emitters");
    await syncOperationalNotifications({ followUpsDue: relancesDue, devisAEnvoyer });
  } catch (err) {
    console.error("[accueil] sync notifications", err);
  }

  const { listNotifications } = await import("@/lib/notifications/service");
  const actionNotifs = await listNotifications({ unreadOnly: true, type: "actions", limit: 8 });

  const [initialPrefs, weekStats] = await Promise.all([
    loadDashboardLayout(),
    (async () => {
      const db = await getDb();
      if (!db) return emptyWeekStats();
      try {
        return await getWeekStats(db);
      } catch {
        return emptyWeekStats();
      }
    })(),
  ]);

  return (
    <HomeDashboard
      initialPrefs={initialPrefs}
      weekStats={weekStats}
      firstName={viewer?.firstName}
      chantiers={chantiers}
      clients={clients}
      pendingDocs={pending}
      devisAEnvoyer={devisAEnvoyer}
      facturesClient={facturesClient.length}
      relancesDue={relancesDue}
      followUps={followUps}
      alerts={alerts}
      articles={ranking.articles}
      outbound={outbound}
      documents={allDocs}
      recentPieces={recentPieces}
      company={company}
      actionNotifications={actionNotifs}
      showDashboardTour={viewer?.needsTour === true}
    />
  );
}
