import { EntrepriseForm } from "@/components/metier/entreprise-form";
import { emptyCompany } from "@/lib/metier/company";
import { getCompanyProfile } from "@/lib/metier/queries";
import { getDb } from "@/lib/db";
import { getViewer } from "@/lib/session";
import { canEditSection, canViewSection } from "@/lib/settings/roles";
import { getEntrepriseConfig } from "@/lib/settings/entreprise-config";
import { SettingsSection } from "@/components/settings/settings-section";

export const metadata = { title: "Entreprise · Paramètres" };

export default async function ParametresEntreprisePage() {
  const [viewer, profil, { role }] = await Promise.all([
    getViewer(),
    getCompanyProfile(),
    getEntrepriseConfig(),
  ]);
  if (!canViewSection(role, "entreprise")) {
    return <p className="text-[14px] text-muted-foreground">Accès non autorisé.</p>;
  }
  const filled = profil ?? emptyCompany(viewer?.email ?? "");
  let logoUrl: string | null = null;
  const db = await getDb();
  if (db && filled.logo_path) {
    const { data } = await db.supabase.storage.from("documents").createSignedUrl(filled.logo_path, 3600);
    logoUrl = data?.signedUrl ?? null;
  }
  const editable = canEditSection(role, "entreprise");

  return (
    <SettingsSection
      title="Informations de l’entreprise"
      description="Identité légale et coordonnées reprises sur vos devis, bons et factures PDF."
      scope="entreprise"
    >
      {editable ? (
        <EntrepriseForm profil={filled} logoUrl={logoUrl} />
      ) : (
        <div className="card-soft space-y-2 p-5 text-[14px]">
          <p className="font-medium text-ink">{filled.raison_sociale || "—"}</p>
          <p className="text-muted-foreground">SIRET {filled.siret || "—"}</p>
          <p className="text-muted-foreground">
            {[filled.adresse_rue, filled.adresse_code_postal, filled.adresse_ville].filter(Boolean).join(", ") ||
              "Adresse non renseignée"}
          </p>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Lecture seule — seuls les administrateurs peuvent modifier ces informations.
          </p>
        </div>
      )}
    </SettingsSection>
  );
}
