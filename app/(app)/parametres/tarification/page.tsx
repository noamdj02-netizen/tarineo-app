import { SettingsSection } from "@/components/settings/settings-section";
import { SettingsSaveForm } from "@/components/settings/settings-save-form";
import { saveCommercialSettingsAction } from "@/app/(app)/parametres/actions";
import { getEntrepriseConfig } from "@/lib/settings/entreprise-config";
import { canEditSection, canViewSection } from "@/lib/settings/roles";

export const metadata = { title: "Tarification · Paramètres" };

export default async function ParametresTarificationPage() {
  const { settings, role, profile } = await getEntrepriseConfig();
  if (!canViewSection(role, "tarification")) {
    return <p className="text-[14px] text-muted-foreground">Accès non autorisé.</p>;
  }
  const editable = canEditSection(role, "tarification");
  const c = settings.commercial;
  const marge = c.margeCiblePct ?? profile?.marge_par_defaut_pct ?? null;

  return (
    <SettingsSection
      title="Tarification"
      description="Références commerciales pour vos devis. L’IA et le Copilote n’inventent jamais de prix : ils utilisent uniquement ces valeurs si vous les avez renseignées."
      scope="entreprise"
    >
      <div className="card-soft p-5 sm:p-6">
        <SettingsSaveForm action={saveCommercialSettingsAction} disabled={!editable}>
          <Field label="Taux horaire HT (€)" name="tauxHoraireHt" type="number" step="0.01" defaultValue={c.tauxHoraireHt} />
          <Field
            label="Coefficient matériaux"
            name="coefficientMateriaux"
            type="number"
            step="0.01"
            defaultValue={c.coefficientMateriaux}
            hint="Ex. 1,35"
          />
          <Field label="Marge cible (%)" name="margeCiblePct" type="number" step="0.1" defaultValue={marge} />
          <Field label="TVA par défaut (%)" name="tvaDefautPct" type="number" step="0.1" defaultValue={c.tvaDefautPct} hint="Ex. 10 ou 20" />
          <Field label="Acompte par défaut (%)" name="acomptePct" type="number" step="1" defaultValue={c.acomptePct} />
          <Field label="Validité devis (jours)" name="validiteDevisJours" type="number" step="1" defaultValue={c.validiteDevisJours} />
          <label className="text-[13px] text-muted-foreground">
            Conditions de paiement
            <input
              name="conditionsPaiement"
              defaultValue={c.conditionsPaiement}
              placeholder="Ex. 30 jours fin de mois"
              className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3 text-[14px] text-ink"
            />
          </label>
        </SettingsSaveForm>
      </div>
    </SettingsSection>
  );
}

function Field({
  label,
  name,
  type,
  step,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  type: string;
  step?: string;
  defaultValue: number | null;
  hint?: string;
}) {
  return (
    <label className="text-[13px] text-muted-foreground">
      {label}
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue ?? ""}
        placeholder="À renseigner"
        className="mt-1 h-11 w-full max-w-[220px] rounded-xl border border-line bg-surface px-3 text-[14px] text-ink tabular-nums"
      />
      {hint ? <span className="mt-1 block text-[12px] text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
