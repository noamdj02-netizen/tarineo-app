import { SettingsSection } from "@/components/settings/settings-section";
import { getEntrepriseConfig } from "@/lib/settings/entreprise-config";
import { canViewSection, ROLE_LABEL } from "@/lib/settings/roles";
import { getViewer } from "@/lib/session";

export const metadata = { title: "Équipe · Paramètres" };

export default async function ParametresEquipePage() {
  const [{ role }, viewer] = await Promise.all([getEntrepriseConfig(), getViewer()]);
  if (!canViewSection(role, "equipe")) {
    return <p className="text-[14px] text-muted-foreground">Accès non autorisé.</p>;
  }

  return (
    <SettingsSection
      title="Équipe & accès"
      description="Gestion des membres et des rôles. L’architecture multi-utilisateurs est prête ; aujourd’hui votre compte est le dirigeant de l’espace."
      scope="entreprise"
    >
      <div className="card-soft flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="text-[15px] font-medium text-ink">
              {[viewer?.firstName, viewer?.lastName].filter(Boolean).join(" ") || viewer?.email || "Vous"}
            </p>
            <p className="text-[13px] text-muted-foreground">{viewer?.email}</p>
          </div>
          <span className="rounded-full bg-st-focus-soft px-2.5 py-1 text-[12px] font-medium text-st-focus-ink">
            {ROLE_LABEL[role]}
          </span>
        </div>
        <div>
          <p className="text-[13px] font-medium text-ink">Rôles prévus</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-muted-foreground">
            <li>Dirigeant / Admin — accès complet</li>
            <li>Chef de chantier — opérationnel, pas les réglages sensibles</li>
            <li>Comptable — documents et finance, pas l’abonnement</li>
          </ul>
        </div>
        <p className="rounded-xl border border-dashed border-line bg-surface-2 px-4 py-3 text-[13px] text-muted-foreground">
          Invitations d’équipe : bientôt. Aucune invitation fictive n’est affichée comme active.
        </p>
      </div>
    </SettingsSection>
  );
}
