import "server-only";
import { loadConnectorSignals } from "@/lib/connectors/signals";
import { data } from "@/lib/mcp/data";
import { getDb } from "@/lib/db";
import { getPlan } from "@/lib/billing/plan";
import { isStripeConfigured } from "@/lib/billing/stripe";
import { tarineoEmailPlatformConnected } from "@/lib/integrations/registry";
import { createClient } from "@/lib/supabase/server";
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

export type LoadIntegrationsOpts = { oauthError?: boolean };

/** État brut (liaisons DB) — utiliser `loadVerifiedIntegrationsSnapshot` pour le hub. */
export async function loadIntegrationsSnapshot(
  opts?: LoadIntegrationsOpts,
): Promise<IntegrationSnapshot[]> {
  const db = await getDb();
  const [signals, keys, session] = await Promise.all([
    loadConnectorSignals(),
    db ? data.listApiKeys(db.user.id).catch(() => []) : Promise.resolve([]),
    db ? createClient().then((c) => c.auth.getSession()) : Promise.resolve({ data: { session: null } }),
  ]);
  const providerToken = session.data.session?.provider_token;
  const planInfo = db ? await getPlan() : null;
  const waitlist = waitlistFromMeta(db?.user.user_metadata as Record<string, unknown> | undefined);
  const gmail = signals.connections.gmail;
  const calendar = signals.connections["apple-calendar"];
  const activeKeys = keys.filter((k) => !k.revokedAt);
  const latestKey = activeKeys.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];

  return INTEGRATIONS.map((def): IntegrationSnapshot => {
    const waitlisted = waitlist.includes(def.id);
    if (def.id === "tarineo_email") {
      const ok = tarineoEmailPlatformConnected();
      return {
        ...def,
        status: ok ? "available" : "requires_setup",
        accountLabel: ok ? "contact@tarineo.fr" : null,
        errorMessage: ok ? null : "Service non configuré sur cet environnement.",
        waitlisted,
      };
    }
    if (def.id === "stripe_billing") {
      if (!isStripeConfigured()) {
        return {
          ...def,
          status: "requires_setup",
          errorMessage: "Facturation non configurée sur cet environnement.",
          waitlisted,
        };
      }
      const label = planInfo
        ? planInfo.plan === "founder"
          ? "Fondateur"
          : planInfo.isFreeTrial
            ? "Essai Pro"
            : planInfo.plan === "free"
              ? "Gratuit"
              : `Plan ${planInfo.plan}`
        : "Gratuit";
      return {
        ...def,
        status: "available",
        accountLabel: label,
        waitlisted,
      };
    }
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
        const needsReconnect = !providerToken;
        return {
          ...def,
          status: needsReconnect ? "reconnection_required" : "connected",
          accountLabel: gmail.label || signals.googleEmail,
          connectedAt: gmail.at,
          lastSyncAt: gmail.at,
          errorMessage: needsReconnect
            ? "Réautorisez Google pour renouveler l’accès Gmail."
            : null,
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
