import { IntegrationsBoard } from "@/components/settings/integrations-board";
import { PageHead } from "@/components/shell/page-head";
import { AutomationsSettings } from "@/components/tarineo/panels/automations-settings";
import { ensureAutomationDefinitions } from "@/lib/automation/definitions";
import { loadVerifiedIntegrationsSnapshot } from "@/lib/integrations/verified-snapshot";
import { INTEGRATIONS_HUB_SECTION_ID } from "@/lib/integrations/hub";
import { R } from "@/lib/routes";
import { canUseFeature } from "@/lib/billing/entitlements";
import { getPlan } from "@/lib/billing/plan";
import { getEntrepriseConfig } from "@/lib/settings/entreprise-config";
import { canEditSection, canViewSection } from "@/lib/settings/roles";

export const metadata = { title: "Automatisations & connexions" };

export default async function AutomatisationsPage({
  searchParams,
}: {
  searchParams: Promise<{ bound?: string; erreur?: string }>;
}) {
  const sp = await searchParams;
  const { role } = await getEntrepriseConfig();
  const showIntegrations = canViewSection(role, "integrations");
  const canEditIntegrations = canEditSection(role, "integrations");
  const oauthError = sp.erreur === "google";

  const [rows, integrationItems, plan] = await Promise.all([
    ensureAutomationDefinitions(),
    showIntegrations ? loadVerifiedIntegrationsSnapshot({ oauthError }) : Promise.resolve([]),
    getPlan(),
  ]);
  const canQuoteAuto = canUseFeature(plan, "quote_followup_auto");

  const quote = rows.find((r) => r.slug === "quote_followup") ?? null;
  const margin = rows.find((r) => r.slug === "margin_below_target") ?? null;

  return (
    <section className="flex flex-col gap-10 pb-10">
      <PageHead
        label="Pilotage"
        title="Automatisations & connexions"
        crumbs={[
          { href: R.accueil, label: "Accueil" },
          { label: "Automatisations" },
        ]}
      >
        <p className="text-[14px] text-muted-foreground">
          Connectez vos outils, puis activez les relances devis et les alertes marge.
        </p>
      </PageHead>

      {showIntegrations ? (
        <div id={INTEGRATIONS_HUB_SECTION_ID} className="scroll-mt-6 flex flex-col gap-4">
          <div>
            <h2 className="text-[17px] font-semibold text-ink">Connexions</h2>
            <p className="mt-1 text-[13.5px] text-muted-foreground">
              Chaque service est vérifié avant d’afficher « Connecté ». Les relances e-mail passent par
              E-mails TARINEO (Resend).
            </p>
          </div>
          <IntegrationsBoard
            items={integrationItems}
            canEdit={canEditIntegrations}
            bound={sp.bound ?? null}
            oauthError={oauthError}
          />
        </div>
      ) : null}

      <div className="border-t border-line pt-8">
        <h2 className="mb-6 text-[17px] font-semibold text-ink">Règles automatiques</h2>
        <AutomationsSettings quote={quote} margin={margin} canQuoteAuto={canQuoteAuto} />
      </div>
    </section>
  );
}
