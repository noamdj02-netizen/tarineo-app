import "server-only";
import { fetchFeedEvents } from "@/lib/calendar/ical";
import { getDb } from "@/lib/db";
import type { ConnectionTestResult } from "../types";

export async function testIcalConnection(): Promise<ConnectionTestResult> {
  const checkedAt = new Date().toISOString();
  const db = await getDb();
  if (!db) {
    return {
      integrationId: "calendar_ical",
      outcome: "not_connected",
      message: "Connectez-vous pour tester l’agenda.",
      checkedAt,
    };
  }
  const { data, error } = await db.supabase
    .from("calendar_feeds")
    .select("url")
    .eq("user_id", db.user.id)
    .maybeSingle();
  if (error || !data?.url) {
    return {
      integrationId: "calendar_ical",
      outcome: "not_connected",
      message: "Aucun flux iCal configuré. Ajoutez-le depuis l’accueil.",
      checkedAt,
    };
  }
  try {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 14);
    const events = await fetchFeedEvents(data.url, from, to);
    return {
      integrationId: "calendar_ical",
      outcome: "ok",
      message: `Flux iCal accessible (${events.length} événement${events.length > 1 ? "s" : ""} sur 14 jours).`,
      checkedAt,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Flux invalide.";
    return {
      integrationId: "calendar_ical",
      outcome: "error",
      message: msg,
      checkedAt,
    };
  }
}
