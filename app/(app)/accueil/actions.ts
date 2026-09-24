"use server";

import { revalidatePath } from "next/cache";
import { fetchFeedEvents, normalizeFeedUrl } from "@/lib/calendar/ical";
import {
  MAX_RANGE_DAYS,
  type CalEvent,
  type CalendarFeedInfo,
} from "@/lib/calendar/types";
import { getDb } from "@/lib/db";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

function toDate(v: unknown) {
  if (typeof v !== "string") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Événements Navpit + iCal entre deux instants (ISO). */
export async function getCalendar(
  fromIso: string,
  toIso: string,
): Promise<
  Result<{
    events: CalEvent[];
    feed: CalendarFeedInfo;
    feedError: string | null;
  }>
> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  const from = toDate(fromIso);
  const to = toDate(toIso);
  if (
    !from ||
    !to ||
    to <= from ||
    to.getTime() - from.getTime() > MAX_RANGE_DAYS * 864e5
  ) {
    return { ok: false, error: "Période invalide." };
  }

  const [{ data: rows }, { data: feedRow }] = await Promise.all([
    db.supabase
      .from("calendar_events")
      .select("id, title, starts_at, ends_at, all_day")
      .eq("user_id", db.user.id)
      .gte("starts_at", from.toISOString())
      .lt("starts_at", to.toISOString())
      .order("starts_at")
      .limit(300),
    db.supabase
      .from("calendar_feeds")
      .select("url")
      .eq("user_id", db.user.id)
      .maybeSingle(),
  ]);

  const events: CalEvent[] = (rows ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    start: r.starts_at,
    end: r.ends_at,
    allDay: r.all_day,
    // stocké à midi UTC : la date reste la bonne quel que soit le fuseau
    day: r.all_day ? r.starts_at.slice(0, 10) : null,
    source: "navpit",
    project: null,
  }));

  let feed: CalendarFeedInfo = { connected: false };
  let feedError: string | null = null;
  const norm = feedRow ? normalizeFeedUrl(feedRow.url) : null;
  if (norm) {
    feed = { connected: true, provider: norm.provider };
    try {
      events.push(...(await fetchFeedEvents(norm.url, from, to)));
    } catch (e) {
      feedError = e instanceof Error ? e.message : "Calendrier injoignable.";
    }
  }

  events.sort((a, b) => a.start.localeCompare(b.start));
  return { ok: true, events, feed, feedError };
}

export async function addCalendarEvent(input: {
  title: string;
  startsAt: string;
  endsAt?: string | null;
  allDay?: boolean;
  day?: string;
}): Promise<Result<{ id: string }>> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  const title =
    typeof input.title === "string" ? input.title.trim().slice(0, 120) : "";
  if (!title) return { ok: false, error: "Donne un titre à l’événement." };
  const allDay = input.allDay === true;
  const start = allDay
    ? typeof input.day === "string" && DAY.test(input.day)
      ? new Date(`${input.day}T12:00:00Z`)
      : null
    : toDate(input.startsAt);
  if (!start) return { ok: false, error: "Date invalide." };
  const end = allDay ? null : input.endsAt ? toDate(input.endsAt) : null;
  if (end && end < start)
    return { ok: false, error: "La fin est avant le début." };

  const { data, error } = await db.supabase
    .from("calendar_events")
    .insert({
      user_id: db.user.id,
      title,
      starts_at: start.toISOString(),
      ends_at: end?.toISOString() ?? null,
      all_day: allDay,
    })
    .select("id")
    .single();
  if (error || !data)
    return { ok: false, error: "Impossible d’ajouter l’événement." };
  revalidatePath("/accueil");
  return { ok: true, id: data.id };
}

export async function deleteCalendarEvent(id: string): Promise<Result> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  if (!UUID.test(id)) return { ok: false, error: "Événement introuvable." };
  const { error } = await db.supabase
    .from("calendar_events")
    .delete()
    .eq("id", id)
    .eq("user_id", db.user.id);
  if (error) return { ok: false, error: "Impossible de supprimer." };
  revalidatePath("/accueil");
  return { ok: true };
}

/** Enregistre le lien iCal privé après avoir vérifié qu'il répond. */
export async function saveCalendarFeed(
  raw: string,
): Promise<Result<{ provider: string }>> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  const norm = typeof raw === "string" ? normalizeFeedUrl(raw) : null;
  if (!norm) {
    return {
      ok: false,
      error:
        "Colle le lien iCal privé de Google Agenda, Apple Calendrier (iCloud) ou Outlook.",
    };
  }
  try {
    const now = new Date();
    await fetchFeedEvents(norm.url, now, new Date(now.getTime() + 864e5));
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Calendrier injoignable.",
    };
  }
  const { error } = await db.supabase
    .from("calendar_feeds")
    .upsert({ user_id: db.user.id, url: norm.url }, { onConflict: "user_id" });
  if (error) return { ok: false, error: "Impossible d’enregistrer le lien." };
  revalidatePath("/accueil");
  return { ok: true, provider: norm.provider };
}

export async function removeCalendarFeed(): Promise<Result> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  const { error } = await db.supabase
    .from("calendar_feeds")
    .delete()
    .eq("user_id", db.user.id);
  if (error) return { ok: false, error: "Impossible de retirer le lien." };
  revalidatePath("/accueil");
  return { ok: true };
}
