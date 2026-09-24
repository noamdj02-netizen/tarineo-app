import ical, { type VEvent } from "node-ical";
import type { CalEvent } from "./types";

/**
 * Seuls les calendriers publics des grands fournisseurs sont acceptés :
 * le serveur ne va jamais chercher une adresse arbitraire (pas de SSRF).
 */
const PROVIDERS: { suffix: string; name: string }[] = [
  { suffix: "calendar.google.com", name: "Google Agenda" },
  { suffix: "icloud.com", name: "Apple Calendrier" },
  { suffix: "outlook.live.com", name: "Outlook" },
  { suffix: "outlook.office365.com", name: "Outlook" },
];

const MAX_BYTES = 5_000_000;
const MAX_EVENTS = 400;

function providerOf(host: string) {
  const h = host.toLowerCase();
  return (
    PROVIDERS.find((p) => h === p.suffix || h.endsWith("." + p.suffix)) ?? null
  );
}

/** Normalise un lien iCal (webcal:// → https://) ; null s'il n'est pas accepté. */
export function normalizeFeedUrl(
  raw: string,
): { url: string; provider: string } | null {
  let u: URL;
  try {
    u = new URL(raw.trim().replace(/^webcal:\/\//i, "https://"));
  } catch {
    return null;
  }
  if (
    u.protocol !== "https:" ||
    u.username ||
    u.password ||
    (u.port && u.port !== "443")
  ) {
    return null;
  }
  const p = providerOf(u.hostname);
  return p ? { url: u.toString(), provider: p.name } : null;
}

async function download(url: string): Promise<string> {
  let target = url;
  // suit au plus 2 redirections, et seulement vers un fournisseur autorisé
  for (let hop = 0; hop < 3; hop++) {
    const res = await fetch(target, {
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
      headers: { accept: "text/calendar, text/plain;q=0.9" },
      next: { revalidate: 300 },
    });
    if (res.status >= 300 && res.status < 400) {
      const next = res.headers.get("location");
      const ok = next
        ? normalizeFeedUrl(new URL(next, target).toString())
        : null;
      if (!ok) throw new Error("Redirection refusée.");
      target = ok.url;
      continue;
    }
    if (!res.ok) throw new Error(`Le calendrier répond ${res.status}.`);
    const len = Number(res.headers.get("content-length") ?? 0);
    if (len > MAX_BYTES) throw new Error("Calendrier trop gros.");
    const text = await res.text();
    if (text.length > MAX_BYTES) throw new Error("Calendrier trop gros.");
    if (!text.includes("BEGIN:VCALENDAR"))
      throw new Error("Ce lien n’est pas un calendrier iCal.");
    return text;
  }
  throw new Error("Trop de redirections.");
}

const text = (v: unknown) =>
  typeof v === "string"
    ? v
    : v && typeof v === "object" && "val" in v
      ? String(v.val)
      : "";

/** Jour AAAA-MM-JJ d'une date « toute la journée » (node-ical la place à minuit, heure locale du serveur). */
function dayKey(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Événements du calendrier iCal entre `from` et `to` (récurrences comprises). */
export async function fetchFeedEvents(
  url: string,
  from: Date,
  to: Date,
): Promise<CalEvent[]> {
  const data = ical.sync.parseICS(await download(url));
  const out: CalEvent[] = [];
  for (const [key, item] of Object.entries(data)) {
    if (!item || item.type !== "VEVENT") continue;
    const ev = item as VEvent;
    if (ev.status === "CANCELLED") continue;
    let instances;
    try {
      instances = ical.expandRecurringEvent(ev, {
        from,
        to,
        expandOngoing: true,
      });
    } catch {
      continue;
    }
    for (const inst of instances) {
      const start = new Date(inst.start);
      if (Number.isNaN(start.getTime())) continue;
      out.push({
        id: `ical:${key}:${start.getTime()}`,
        title: text(inst.summary).slice(0, 120) || "Sans titre",
        start: start.toISOString(),
        end: inst.end ? new Date(inst.end).toISOString() : null,
        allDay: inst.isFullDay,
        day: inst.isFullDay ? dayKey(start) : null,
        source: "ical",
        project: null,
      });
      if (out.length >= MAX_EVENTS) return out;
    }
  }
  return out;
}
