import "server-only";
import { getDb } from "@/lib/db";
import { getCompanyProfile } from "@/lib/metier/queries";
import type { CompanyProfile } from "@/lib/metier/company";
import {
  emptyWorkspaceSettings,
  parseWorkspaceSettings,
  type CompanyWorkspaceSettings,
} from "@/lib/settings/workspace-settings";
import { resolveWorkspaceRole, type WorkspaceRole } from "@/lib/settings/roles";
import { sessionIsOwner } from "@/lib/admin/guard";

/**
 * Source unique de configuration entreprise pour devis / PDF / IA / paramètres.
 */
export type EntrepriseConfig = {
  profile: CompanyProfile | null;
  settings: CompanyWorkspaceSettings;
  role: WorkspaceRole;
};

const memSettings = new Map<string, CompanyWorkspaceSettings>();

export async function getEntrepriseConfig(): Promise<EntrepriseConfig> {
  const [profile, owner, db] = await Promise.all([
    getCompanyProfile(),
    sessionIsOwner(),
    getDb(),
  ]);
  const role = resolveWorkspaceRole({ isOwner: owner });
  const userId = db?.user.id ?? "local";

  let settings = emptyWorkspaceSettings();
  if (profile?.marge_par_defaut_pct != null) {
    settings = {
      ...settings,
      commercial: {
        ...settings.commercial,
        margeCiblePct: Number(profile.marge_par_defaut_pct) || null,
      },
    };
  }

  if (db) {
    const { data } = await db.supabase
      .from("company_profiles")
      .select("settings")
      .eq("user_id", db.user.id)
      .maybeSingle();
    if (data && "settings" in data && data.settings != null) {
      settings = parseWorkspaceSettings(data.settings);
      if (profile?.marge_par_defaut_pct != null && settings.commercial.margeCiblePct == null) {
        settings.commercial.margeCiblePct = Number(profile.marge_par_defaut_pct) || null;
      }
    } else if (memSettings.has(userId)) {
      settings = memSettings.get(userId)!;
    }
  } else if (memSettings.has(userId)) {
    settings = memSettings.get(userId)!;
  }

  return { profile, settings, role };
}

export async function saveWorkspaceSettings(next: CompanyWorkspaceSettings): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = await getDb();
  const userId = db?.user.id ?? "local";
  memSettings.set(userId, next);

  if (!db) return { ok: true };

  const patch = {
    settings: next,
    marge_par_defaut_pct: next.commercial.margeCiblePct ?? 35,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await db.supabase
    .from("company_profiles")
    .update(patch)
    .eq("user_id", db.user.id)
    .select("user_id")
    .maybeSingle();

  if (error) {
    // Colonne settings absente (migration non appliquée) : mémoire locale OK
    if (/settings|column/i.test(error.message)) {
      console.warn("[saveWorkspaceSettings] colonne settings absente — fallback mémoire", error.message);
      return { ok: true };
    }
    console.error("[saveWorkspaceSettings]", error);
    return { ok: false, error: "Impossible d’enregistrer les paramètres." };
  }
  if (!data) {
    return {
      ok: false,
      error: "Renseignez d’abord les informations de l’entreprise avant ces paramètres.",
    };
  }
  return { ok: true };
}
