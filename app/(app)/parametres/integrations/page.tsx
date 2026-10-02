import { SettingsSection } from "@/components/settings/settings-section";
import { IntegrationsBoard } from "@/components/settings/integrations-board";
import { getEntrepriseConfig } from "@/lib/settings/entreprise-config";
import { loadIntegrationsSnapshot } from "@/lib/settings/integrations-store";
import { canEditSection, canViewSection } from "@/lib/settings/roles";

export const metadata = { title: "Intégrations · Paramètres" };

export default async function ParametresIntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ bound?: string; erreur?: string }>;
}) {
  const sp = await searchParams;
  const { role } = await getEntrepriseConfig();
  if (!canViewSection(role, "integrations")) {
    return <p className="text-[14px] text-muted-foreground">Accès non autorisé.</p>;
  }

  const oauthError = sp.erreur === "google";
  const items = await loadIntegrationsSnapshot({ oauthError });
  const editable = canEditSection(role, "integrations");

  return (
    <SettingsSection
      title="Intégrations"
      description="Connectez TARINEO aux outils que vous utilisez déjà."
      scope="entreprise"
    >
      <IntegrationsBoard
        items={items}
        canEdit={editable}
        bound={sp.bound ?? null}
        oauthError={oauthError}
      />
    </SettingsSection>
  );
}
