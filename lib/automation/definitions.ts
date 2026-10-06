import "server-only";
import { DEFAULT_MARGIN_CONFIG, DEFAULT_QUOTE_FOLLOWUP_CONFIG } from "@/lib/automation/config";
import { isMissingAutomationTable } from "@/lib/automation/db";
import type { AutomationDefinitionRow, AutomationSlug } from "@/lib/automation/types";
import { getDb } from "@/lib/db";

function mapRow(row: Record<string, unknown>): AutomationDefinitionRow {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    slug: row.slug as AutomationSlug,
    enabled: Boolean(row.enabled),
    config: (row.config ?? {}) as AutomationDefinitionRow["config"],
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

const SEED: Record<AutomationSlug, { enabled: boolean; config: Record<string, unknown> }> = {
  quote_followup: { enabled: false, config: { ...DEFAULT_QUOTE_FOLLOWUP_CONFIG } },
  margin_below_target: { enabled: false, config: { ...DEFAULT_MARGIN_CONFIG, enabled: true } },
};

/** Crée les lignes manquantes (enabled=false) sans écraser une config existante. */
export async function ensureAutomationDefinitions(): Promise<AutomationDefinitionRow[]> {
  const db = await getDb();
  if (!db) return [];

  for (const slug of Object.keys(SEED) as AutomationSlug[]) {
    const seed = SEED[slug];
    const { error } = await db.supabase.from("automation_definitions").upsert(
      {
        user_id: db.user.id,
        slug,
        enabled: seed.enabled,
        config: seed.config,
      } as never,
      { onConflict: "user_id,slug", ignoreDuplicates: true },
    );
    if (error && !isMissingAutomationTable(error)) {
      console.error("[automation] ensureDefinitions", slug, error);
    }
  }

  const { data, error } = await db.supabase
    .from("automation_definitions")
    .select("*")
    .eq("user_id", db.user.id)
    .in("slug", ["quote_followup", "margin_below_target"]);
  if (error) {
    if (isMissingAutomationTable(error)) return [];
    console.error("[automation] listDefinitions", error);
    return [];
  }
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export async function updateAutomationDefinition(input: {
  slug: AutomationSlug;
  enabled: boolean;
  config: Record<string, unknown>;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Session requise." };
  await ensureAutomationDefinitions();
  const { error } = await db.supabase
    .from("automation_definitions")
    .update({ enabled: input.enabled, config: input.config } as never)
    .eq("user_id", db.user.id)
    .eq("slug", input.slug);
  if (error) {
    if (isMissingAutomationTable(error)) {
      return { ok: false, error: "Tables automation non déployées. Appliquez la migration staging." };
    }
    return { ok: false, error: "Enregistrement impossible." };
  }
  return { ok: true };
}
