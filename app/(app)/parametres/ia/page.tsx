import Link from "next/link";
import { SettingsSection } from "@/components/settings/settings-section";
import { SettingsSaveForm } from "@/components/settings/settings-save-form";
import { saveAiSettingsAction } from "@/app/(app)/parametres/actions";
import { getEntrepriseConfig } from "@/lib/settings/entreprise-config";
import { canEditSection, canViewSection } from "@/lib/settings/roles";
import { R } from "@/lib/routes";

export const metadata = { title: "IA & Copilote · Paramètres" };

const FEATURES = [
  {
    name: "analyseDevis",
    title: "Analyse de devis",
    text: "Lit prix, quantités, TVA, fournisseur et signale les incohérences — uniquement à partir du document.",
  },
  {
    name: "analyseFacture",
    title: "Analyse de facture",
    text: "Extrait les lignes et totaux écrits sur la facture. Aucun montant inventé.",
  },
  {
    name: "detectionHausses",
    title: "Détection de hausses",
    text: "Compare les prix fournisseur d’un même article entre documents importés.",
  },
  {
    name: "copilote",
    title: "Copilote",
    text: "Assistant BTP sur vos chantiers et pièces. Actions sensibles : confirmation avant mutation.",
  },
] as const;

export default async function ParametresIaPage() {
  const { settings, role } = await getEntrepriseConfig();
  if (!canViewSection(role, "ia")) {
    return <p className="text-[14px] text-muted-foreground">Accès non autorisé.</p>;
  }
  const editable = canEditSection(role, "ia");
  const ai = settings.ai;

  return (
    <SettingsSection
      title="IA & Copilote"
      description="Fonctionnalités réellement branchées dans TARINEO. Les paramètres tarifaires d’entreprise servent de référence — jamais d’invention de prix."
      scope="entreprise"
    >
      <div className="rounded-card border border-line bg-surface-2 px-4 py-3.5 text-[13.5px] text-muted-foreground">
        <span className="font-medium text-ink">Analyse IA</span> ({R.devisAnalyser}) : import et lecture de PDF ou
        photos. <span className="font-medium text-ink">Copilote</span> (⌘J) : chat sur vos chantiers et pièces — ce
        ne sont pas les mêmes écrans.{" "}
        <Link href={R.devisAnalyser} className="font-medium text-brand-orange underline-offset-2 hover:underline">
          Ouvrir Analyse IA
        </Link>
      </div>
      <div className="card-soft p-5 sm:p-6">
        <SettingsSaveForm action={saveAiSettingsAction} disabled={!editable}>
          <ul className="flex flex-col gap-4">
            {FEATURES.map((f) => (
              <li key={f.name} className="flex items-start justify-between gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-ink">{f.title}</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">{f.text}</p>
                </div>
                <label className="inline-flex shrink-0 items-center gap-2 text-[13px]">
                  <input
                    type="checkbox"
                    name={f.name}
                    defaultChecked={ai[f.name]}
                    className="size-4 rounded border-line accent-[var(--tarineo-orange)]"
                  />
                  <span className="text-muted-foreground">Activé</span>
                </label>
              </li>
            ))}
          </ul>
        </SettingsSaveForm>
      </div>
    </SettingsSection>
  );
}
