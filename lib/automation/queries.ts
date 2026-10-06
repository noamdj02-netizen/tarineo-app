import "server-only";
import { getDb } from "@/lib/db";
import { mergeMarginConfig, mergeQuoteFollowupConfig } from "@/lib/automation/config";
import { isMissingAutomationTable } from "@/lib/automation/db";
import type { AutomationDefinitionRow, AutomationSlug } from "@/lib/automation/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function mapDefinition(row: Record<string, unknown>): AutomationDefinitionRow {
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

export async function getAutomationDefinition(slug: AutomationSlug): Promise<AutomationDefinitionRow | null> {
  const db = await getDb();
  if (!db) return null;
  const { data, error } = await db.supabase
    .from("automation_definitions")
    .select("*")
    .eq("user_id", db.user.id)
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    if (isMissingAutomationTable(error)) return null;
    console.error("[automation] getDefinition", error);
    return null;
  }
  return data ? mapDefinition(data as Record<string, unknown>) : null;
}

export async function listEnabledQuoteFollowupDefinitions(): Promise<AutomationDefinitionRow[]> {
  if (!isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("automation_definitions")
    .select("*")
    .eq("slug", "quote_followup")
    .eq("enabled", true);
  if (error) {
    if (isMissingAutomationTable(error)) return [];
    console.error("[automation] listEnabledQuoteFollowup", error);
    return [];
  }
  return (data ?? []).map((r) => mapDefinition(r as Record<string, unknown>));
}

export function quoteFollowupConfigFromDefinition(def: AutomationDefinitionRow | null) {
  return mergeQuoteFollowupConfig(def?.config);
}

export function marginConfigFromDefinition(def: AutomationDefinitionRow | null) {
  return mergeMarginConfig(def?.config);
}
