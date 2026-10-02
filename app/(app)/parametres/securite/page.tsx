import { SettingsSection } from "@/components/settings/settings-section";
import { PasswordForm } from "@/app/(app)/compte/forms";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getViewer } from "@/lib/session";
import { getEntrepriseConfig } from "@/lib/settings/entreprise-config";
import { canViewSection } from "@/lib/settings/roles";

export const metadata = { title: "Sécurité · Paramètres" };

export default async function ParametresSecuritePage() {
  const [viewer, { role }] = await Promise.all([getViewer(), getEntrepriseConfig()]);
  if (!viewer || !canViewSection(role, "securite")) {
    return <p className="text-[14px] text-muted-foreground">Accès non autorisé.</p>;
  }

  return (
    <SettingsSection
      title="Sécurité"
      description="Mot de passe et session. La double authentification sera proposée lorsqu’elle sera disponible."
      scope="utilisateur"
    >
      <div className="card-soft p-5 sm:p-6">
        <p className="mono-label mb-4">/ Mot de passe ///</p>
        <PasswordForm />
      </div>

      <div className="card-soft p-5 sm:p-6">
        <p className="mono-label mb-3">/ Session ///</p>
        <p className="text-[14px] text-muted-foreground">
          Connecté en tant que <span className="font-medium text-ink">{viewer.email}</span>.
        </p>
        {viewer.canSignOut ? (
          <SignOutButton className="mt-4 inline-flex min-h-11 rounded-pill border border-line px-5 text-[14px] text-muted-foreground hover:bg-accent-soft hover:text-ink" />
        ) : null}
      </div>

      <div className="card-soft border-dashed p-5 sm:p-6">
        <p className="text-[14px] font-medium text-ink">Suppression du compte</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Contactez le support pour une suppression définitive. Aucune action destructive n’est proposée ici sans confirmation humaine.
        </p>
      </div>
    </SettingsSection>
  );
}
