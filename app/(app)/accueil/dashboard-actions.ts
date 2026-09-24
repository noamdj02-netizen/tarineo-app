"use server";

import { getDb } from "@/lib/db";
import {
  DEFAULT_DASHBOARD_PREFS,
  normalizeDashboardPrefs,
  type DashboardPrefs,
} from "@/lib/home/dashboard-prefs";

export async function loadDashboardLayout(): Promise<DashboardPrefs> {
  const db = await getDb();
  if (!db) return DEFAULT_DASHBOARD_PREFS;
  const { data, error } = await db.supabase
    .from("user_dashboard")
    .select("layout")
    .eq("user_id", db.user.id)
    .maybeSingle();
  if (error) return DEFAULT_DASHBOARD_PREFS;
  if (!data?.layout) return DEFAULT_DASHBOARD_PREFS;
  return normalizeDashboardPrefs(data.layout as Partial<DashboardPrefs>);
}

export async function saveDashboardLayout(
  layout: DashboardPrefs,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  const normalized = normalizeDashboardPrefs(layout);
  const { error } = await db.supabase.from("user_dashboard").upsert(
    {
      user_id: db.user.id,
      layout: normalized,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
