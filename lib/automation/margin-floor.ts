import type { CompanyProfile } from "@/lib/metier/company";
import type { CompanyWorkspaceSettings } from "@/lib/settings/workspace-settings";

/**
 * Seuil effectif marge (documenté QA §5) :
 * 1. automation_definitions.config.floorMarginPct (si défini)
 * 2. paramètres entreprise settings.commercial.margeCiblePct
 * 3. profil company_profiles.marge_par_defaut_pct
 * 4. défaut 25 %
 *
 * Alerte si marginPct < floor (égalité = pas d’alerte).
 */
export function effectiveMarginFloorPct(input: {
  configFloor: number | null | undefined;
  settings: CompanyWorkspaceSettings;
  profile: CompanyProfile | null;
}): number {
  if (input.configFloor != null && Number.isFinite(input.configFloor)) return input.configFloor;
  const fromSettings = input.settings.commercial.margeCiblePct;
  if (fromSettings != null && Number.isFinite(fromSettings)) return fromSettings;
  const fromProfile = input.profile?.marge_par_defaut_pct;
  if (fromProfile != null && Number.isFinite(fromProfile)) return fromProfile;
  return 25;
}
