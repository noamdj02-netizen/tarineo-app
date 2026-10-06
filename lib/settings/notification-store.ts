import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getDb } from "@/lib/db";
import {
  DEFAULT_NOTIFICATION_PREFS,
  parseNotificationPreferences,
  preferencesToRow,
  type NotificationPreferences,
} from "@/lib/settings/notification-preferences";

const mem = new Map<string, NotificationPreferences>();

export async function getNotificationPreferencesForUser(
  client: SupabaseClient,
  userId: string,
): Promise<NotificationPreferences> {
  const { data, error } = await client
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return { ...DEFAULT_NOTIFICATION_PREFS, events: {} };
  return parseNotificationPreferences(data);
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const db = await getDb();
  const userId = db?.user.id ?? "local";
  if (!db) return mem.get(userId) ?? { ...DEFAULT_NOTIFICATION_PREFS, events: {} };

  const { data, error } = await db.supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", db.user.id)
    .maybeSingle();

  if (error) {
    if (/notification_preferences|relation|column/i.test(error.message)) {
      return mem.get(userId) ?? { ...DEFAULT_NOTIFICATION_PREFS, events: {} };
    }
    console.error("[getNotificationPreferences]", error.message);
    return mem.get(userId) ?? { ...DEFAULT_NOTIFICATION_PREFS, events: {} };
  }
  if (!data) return mem.get(userId) ?? { ...DEFAULT_NOTIFICATION_PREFS, events: {} };
  return parseNotificationPreferences(data);
}

export async function saveNotificationPreferences(
  next: NotificationPreferences,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = await getDb();
  const userId = db?.user.id ?? "local";
  mem.set(userId, next);
  if (!db) return { ok: true };

  const row = { user_id: db.user.id, ...preferencesToRow(next) };
  const { error } = await db.supabase.from("notification_preferences").upsert(row, {
    onConflict: "user_id",
  });

  if (error) {
    if (/notification_preferences|relation|column/i.test(error.message)) {
      console.warn("[saveNotificationPreferences] table absente — fallback mémoire");
      return { ok: true };
    }
    console.error("[saveNotificationPreferences]", error.message);
    return { ok: false, error: "Impossible d’enregistrer les préférences." };
  }
  return { ok: true };
}
