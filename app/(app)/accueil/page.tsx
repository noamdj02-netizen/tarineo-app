import { loadDashboardLayout } from "@/app/(app)/accueil/dashboard-actions";
import { HomeDashboard } from "@/components/home/home-dashboard";
import { focusChantier, listAlerts, listChantiers, listDocuments, listParties } from "@/lib/metier/queries";
import { getViewer } from "@/lib/session";
import { siteMetadata } from "@/lib/seo";

export const metadata = {
  title: "Tableau de bord",
  ...siteMetadata({ title: "Tableau de bord", path: "/accueil", noIndex: true }),
};

export default async function AccueilPage() {
  const [viewer, chantiers, clients, dashboardLayout, inbound, outbound, alerts] = await Promise.all([
    getViewer(),
    listChantiers(),
    listParties("client"),
    loadDashboardLayout(),
    listDocuments({ direction: "in" }),
    listDocuments({ direction: "out" }),
    listAlerts(),
  ]);
  const focus = focusChantier(chantiers);
  const pending = inbound.filter((d) => !outbound.some((o) => o.source_document_id === d.id));

  return (
    <HomeDashboard
      firstName={viewer?.firstName}
      chantiers={chantiers}
      clients={clients}
      pendingDocs={pending}
      alerts={alerts}
      focus={
        focus
          ? {
              slug: focus.slug,
              name: focus.name,
              next: focus.client_name ? `${focus.client_name} · ${focus.address}` : focus.address,
              docsCount: focus.docs_count,
              pendingCount: pending.filter((d) => d.chantier_slug === focus.slug).length,
            }
          : null
      }
      initialLayout={dashboardLayout}
      showTour={viewer?.needsTour === true}
    />
  );
}
