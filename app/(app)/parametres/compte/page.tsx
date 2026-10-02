import { CreditCard, Languages, Palette } from "lucide-react";
import Link from "next/link";
import { SettingsSection } from "@/components/settings/settings-section";
import { AppearanceSettings } from "@/components/theme/appearance-settings";
import { ApiKeysCard } from "@/components/account/api-keys-card";
import { AvatarForm, LocaleForm, NameForm } from "@/app/(app)/compte/forms";
import { OnboardingLaunch } from "@/app/(app)/compte/onboarding-launch";
import { sessionIsOwner } from "@/lib/admin/guard";
import { getPlan } from "@/lib/billing/plan";
import { FOUNDER, PLAN_LABEL, PRO, STARTER } from "@/lib/billing/plans";
import { WIZARD_STEPS } from "@/lib/onboarding-wizard";
import { getViewer } from "@/lib/session";
import { getEntrepriseConfig } from "@/lib/settings/entreprise-config";
import { canViewSection } from "@/lib/settings/roles";

export const metadata = { title: "Mon compte · Paramètres" };

export default async function ParametresComptePage() {
  const [viewer, plan, owner, { role }] = await Promise.all([
    getViewer(),
    getPlan(),
    sessionIsOwner(),
    getEntrepriseConfig(),
  ]);
  if (!viewer || !canViewSection(role, "compte")) {
    return <p className="text-[14px] text-muted-foreground">Accès non autorisé.</p>;
  }
  const info = plan ?? { plan: "free" as const, interval: "month" as const, tier: 0 as const, periodEnd: null };
  const iv = info.interval ?? "month";
  const price =
    info.plan === "founder"
      ? `${FOUNDER.price} € une fois`
      : info.plan === "starter"
        ? `${STARTER[iv]} € / ${iv === "year" ? "an" : "mois"}`
        : info.plan === "pro"
          ? `${PRO[iv]} € / ${iv === "year" ? "an" : "mois"}`
          : "0 €";

  return (
    <SettingsSection
      title="Mon compte"
      description="Préférences personnelles : identité, langue, apparence."
      scope="utilisateur"
    >
      <div className="flex flex-col gap-4">
        <div className="card-soft p-5 sm:p-6">
          <p className="mono-label mb-3">/ Configuration initiale ///</p>
          <ol className="flex flex-col gap-2">
            {WIZARD_STEPS.map((step, i) => (
              <li key={step} className="flex gap-3 text-[14px] text-ink/85">
                <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-4">
            <OnboardingLaunch needsContinue={viewer.needsOnboarding} />
          </div>
        </div>

        <div className="card-soft p-5 sm:p-6">
          <p className="mono-label mb-4">/ Photo ///</p>
          <AvatarForm avatarUrl={viewer.avatarUrl} initial={viewer.initial} />
        </div>

        <div className="card-soft p-5 sm:p-6">
          <p className="mono-label mb-4">/ Identité ///</p>
          <NameForm firstName={viewer.firstName} lastName={viewer.lastName} email={viewer.email} />
        </div>

        <div className="card-soft p-5 sm:p-6">
          <p className="mb-4 flex items-center gap-2">
            <Languages className="size-4 text-muted-foreground" aria-hidden />
            <span className="mono-label mb-0">/ Langue ///</span>
          </p>
          <LocaleForm locale={viewer.locale} />
        </div>

        <div className="card-soft p-5 sm:p-6">
          <p className="mb-4 flex items-center gap-2">
            <Palette className="size-4 text-muted-foreground" aria-hidden />
            <span className="mono-label mb-0">/ Apparence ///</span>
          </p>
          <AppearanceSettings />
        </div>

        <div className="card-soft p-5 sm:p-6">
          <p className="mb-4 flex items-center gap-2">
            <CreditCard className="size-4 text-muted-foreground" aria-hidden />
            <span className="mono-label mb-0">/ Abonnement ///</span>
          </p>
          <p className="font-display text-[24px] font-semibold tracking-tight">
            {owner ? "Studio · illimité" : `${PLAN_LABEL[info.plan]} · ${price}`}
          </p>
          <Link
            href="/parametres/abonnement"
            className="btn-dark mt-4 inline-flex min-h-11 items-center rounded-pill px-5 text-[14px] font-medium"
          >
            Gérer l’abonnement
          </Link>
        </div>

        <div id="agents">
          <ApiKeysCard />
        </div>
      </div>
    </SettingsSection>
  );
}
