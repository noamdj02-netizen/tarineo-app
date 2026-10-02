import "server-only";
import { loadConnectorSignals } from "@/lib/connectors/signals";
import { data } from "@/lib/mcp/data";
import { getDb } from "@/lib/db";
import {
  INTEGRATIONS,
  type IntegrationSnapshot,
  type IntegrationStatus,
} from "@/lib/settings/integrations-catalog";

function waitlistFromMeta(meta: Record<string, unknown> | undefined): string[] {
  const raw = meta?.integration_waitlist;
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

/** État réel des intégrations pour l’utilisateur courant. */
export async function loadIntegrationsSnapshot(opts?: {
  oauthError?: boolean;
}): Promise<IntegrationSnapshot[]> {
  const db = await getDb();
  const [signals, keys] = await Promise.all([
    loadConnectorSignals(),
    db ? data.listApiKeys(db.user.id).catch(() => []) : Promise.resolve([]),
  ]);
  const waitlist = waitlistFromMeta(db?.user.user_metadata as Record<string, unknown> | undefined);
  const gmail = signals.connections.gmail;
  const calendar = signals.connections["apple-calendar"];
  const activeKeys = keys.filter((k) => !k.revokedAt);
  const latestKey = activeKeys.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];

  return INTEGRATIONS.map((def): IntegrationSnapshot => {
    const waitlisted = waitlist.includes(def.id);
    if (def.id === "google") {
      if (opts?.oauthError) {
        return {
          ...def,
          status: "error",
          errorMessage: "La connexion n’a pas pu être établie.",
          waitlisted,
        };
      }
      if (gmail) {
        return {
          ...def,
          status: "connected",
          accountLabel: gmail.label || signals.googleEmail,
          connectedAt: gmail.at,
          lastSyncAt: gmail.at,
          waitlisted,
        };
      }
      return { ...def, status: "available", waitlisted };
    }
    if (def.id === "calendar_ical") {
      if (calendar) {
        return {
          ...def,
          status: "connected",
          accountLabel: calendar.label,
          connectedAt: calendar.at,
          lastSyncAt: calendar.at,
          waitlisted,
        };
      }
      return { ...def, status: "available", waitlisted };
    }
    if (def.id === "api_tarineo") {
      if (activeKeys.length > 0) {
        return {
          ...def,
          status: "connected",
          accountLabel: `${activeKeys.length} clé${activeKeys.length > 1 ? "s" : ""} · ${latestKey?.prefix ?? ""}••••`,
          connectedAt: latestKey?.createdAt ?? null,
          lastSyncAt: latestKey?.lastUsedAt ?? null,
          waitlisted,
        };
      }
      return { ...def, status: "available", waitlisted };
    }
    if (def.capability === "manual_import") {
      return { ...def, status: "available", waitlisted };
    }
    return {
      ...def,
      status: "coming_soon" satisfies IntegrationStatus,
      waitlisted,
    };
  });
}
