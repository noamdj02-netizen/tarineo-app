import { SettingsSection } from "@/components/settings/settings-section";
import { SettingsSaveForm } from "@/components/settings/settings-save-form";
import { saveDocumentSettingsAction } from "@/app/(app)/parametres/actions";
import { getEntrepriseConfig } from "@/lib/settings/entreprise-config";
import { canEditSection, canViewSection } from "@/lib/settings/roles";
import Link from "next/link";
import { R } from "@/lib/routes";

export const metadata = { title: "Documents · Paramètres" };

export default async function ParametresDocumentsPage() {
  const { settings, role } = await getEntrepriseConfig();
  if (!canViewSection(role, "documents")) {
    return <p className="text-[14px] text-muted-foreground">Accès non autorisé.</p>;
  }
  const editable = canEditSection(role, "documents");
  const d = settings.documents;

  return (
    <SettingsSection
      title="Documents & PDF"
      description="Mentions, numérotation et préférences utilisées sur vos pièces. Logo et identité légale se règlent dans Entreprise."
      scope="entreprise"
    >
      <div className="card-soft flex flex-col gap-3 p-5 sm:p-6">
        <p className="text-[14px] text-muted-foreground">
          Logo, SIRET, TVA et adresse :{" "}
          <Link href="/parametres/entreprise" className="font-medium text-brand-orange underline-offset-2 hover:underline">
            Paramètres → Entreprise
          </Link>
        </p>
        <p className="text-[14px] text-muted-foreground">
          Modèles de devis :{" "}
          <Link href={R.devisNouveau} className="font-medium text-brand-orange underline-offset-2 hover:underline">
            Créer un devis
          </Link>
        </p>
      </div>

      <div className="card-soft p-5 sm:p-6">
        <SettingsSaveForm action={saveDocumentSettingsAction} disabled={!editable}>
          <label className="text-[13px] text-muted-foreground">
            Préfixe de numérotation
            <input
              name="numerotationPrefixe"
              defaultValue={d.numerotationPrefixe}
              placeholder="Ex. DEV-"
              className="mt-1 h-11 w-full max-w-[220px] rounded-xl border border-line bg-surface px-3 text-[14px] text-ink"
            />
          </label>
          <label className="text-[13px] text-muted-foreground">
            Pied de page / mention courte
            <textarea
              name="mentionPiedPage"
              defaultValue={d.mentionPiedPage}
              rows={3}
              className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-[14px] text-ink"
            />
          </label>
          <label className="text-[13px] text-muted-foreground">
            Conditions générales
            <textarea
              name="conditionsGenerales"
              defaultValue={d.conditionsGenerales}
              rows={6}
              className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-[14px] text-ink"
            />
          </label>
        </SettingsSaveForm>
      </div>
    </SettingsSection>
  );
}
