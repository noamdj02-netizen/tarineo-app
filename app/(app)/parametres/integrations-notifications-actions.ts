"use server";

import { revalidatePath } from "next/cache";
import { deactivateTool, markGoogleBound } from "@/lib/connectors/actions";
import { updateUserMeta } from "@/lib/profile";
import { getDb } from "@/lib/db";
import { canEditSection } from "@/lib/settings/roles";
import { getEntrepriseConfig } from "@/lib/settings/entreprise-config";
import {
  integrationSupportsConnectionTest,
  testIntegrationConnection,
} from "@/lib/integrations/registry";
import { isIntegrationId, type IntegrationId } from "@/lib/settings/integrations-catalog";
import {
  getNotificationPreferences,
  saveNotificationPreferences,
} from "@/lib/settings/notification-store";
import type {
  NotificationEventKey,
  NotificationPreferences,
} from "@/lib/settings/notification-preferences";

function refreshIntegrations() {
  revalidatePath("/automatisations");
  revalidatePath("/parametres/integrations");
  revalidatePath("/parametres");
  revalidatePath("/accueil");
}

function refreshNotifications() {
  revalidatePath("/parametres/notifications");
}

export async function testIntegrationConnectionAction(id: string) {
  const { role } = await getEntrepriseConfig();
  if (!canEditSection(role, "integrations")) {
    return { ok: false as const, error: "Permission refusée." };
  }
  if (!isIntegrationId(id) || !integrationSupportsConnectionTest(id)) {
    return { ok: false as const, error: "Test non disponible pour cette intégration." };
  }
  const result = await testIntegrationConnection(id as IntegrationId);
  return { ok: true as const, result };
}

export async function completeGoogleBindAction(tool: "gmail" | "google-drive" = "gmail") {
  const { role } = await getEntrepriseConfig();
  if (!canEditSection(role, "integrations")) {
    return { ok: false as const, error: "Permission refusée." };
  }
  const res = await markGoogleBound(tool);
  if (!res.ok) return res;
  refreshIntegrations();
  return { ok: true as const };
}

export async function disconnectIntegrationAction(id: string) {
  const { role } = await getEntrepriseConfig();
  if (!canEditSection(role, "integrations")) {
    return { ok: false as const, error: "Permission refusée." };
  }
  if (id === "google") {
    const res = await deactivateTool("gmail");
    if (!res.ok) return res;
    refreshIntegrations();
    return { ok: true as const };
  }
  if (id === "calendar_ical") {
    const db = await getDb();
    if (db) {
      await db.supabase.from("calendar_feeds").delete().eq("user_id", db.user.id);
    }
    const res = await deactivateTool("apple-calendar");
    if (!res.ok) return res;
    refreshIntegrations();
    return { ok: true as const };
  }
  return { ok: false as const, error: "Cette intégration ne peut pas être déconnectée ainsi." };
}

export async function joinIntegrationWaitlistAction(id: string) {
  if (!isIntegrationId(id)) return { ok: false as const, error: "Intégration inconnue." };
  const db = await getDb();
  if (!db) return { ok: false as const, error: "Pas connecté." };
  const meta = (db.user.user_metadata ?? {}) as Record<string, unknown>;
  const prev = Array.isArray(meta.integration_waitlist)
    ? meta.integration_waitlist.filter((x): x is string => typeof x === "string")
    : [];
  if (prev.includes(id)) return { ok: true as const, already: true as const };
  const res = await updateUserMeta({ integration_waitlist: [...prev, id] });
  if (!res.ok) return res;
  refreshIntegrations();
  return { ok: true as const, already: false as const };
}

export type NotificationPrefsPatch = Partial<
  Omit<NotificationPreferences, "events">
> & {
  eventKey?: NotificationEventKey;
  eventEmail?: boolean;
  eventInApp?: boolean;
};

export async function saveNotificationPreferencesAction(
  patch: NotificationPrefsPatch,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { role } = await getEntrepriseConfig();
  if (!canEditSection(role, "notifications")) {
    return { ok: false, error: "Permission refusée." };
  }
  const current = await getNotificationPreferences();
  const next: NotificationPreferences = {
    ...current,
    emailQuotes: patch.emailQuotes ?? current.emailQuotes,
    emailInvoices: patch.emailInvoices ?? current.emailInvoices,
    emailSupplierIncreases: patch.emailSupplierIncreases ?? current.emailSupplierIncreases,
    emailFollowups: patch.emailFollowups ?? current.emailFollowups,
    emailCopilot: patch.emailCopilot ?? current.emailCopilot,
    emailProjects: patch.emailProjects ?? current.emailProjects,
    inAppQuotes: patch.inAppQuotes ?? current.inAppQuotes,
    inAppInvoices: patch.inAppInvoices ?? current.inAppInvoices,
    inAppSupplierIncreases: patch.inAppSupplierIncreases ?? current.inAppSupplierIncreases,
    inAppFollowups: patch.inAppFollowups ?? current.inAppFollowups,
    inAppCopilot: patch.inAppCopilot ?? current.inAppCopilot,
    inAppProjects: patch.inAppProjects ?? current.inAppProjects,
    pushQuotes: patch.pushQuotes ?? current.pushQuotes,
    pushInvoices: patch.pushInvoices ?? current.pushInvoices,
    pushSupplierIncreases: patch.pushSupplierIncreases ?? current.pushSupplierIncreases,
    pushFollowups: patch.pushFollowups ?? current.pushFollowups,
    pushCopilot: patch.pushCopilot ?? current.pushCopilot,
    pushProjects: patch.pushProjects ?? current.pushProjects,
    pushEnabled: patch.pushEnabled ?? current.pushEnabled,
    supplierThresholdPct:
      typeof patch.supplierThresholdPct === "number"
        ? Math.min(100, Math.max(0, patch.supplierThresholdPct))
        : current.supplierThresholdPct,
    dailySummaryEnabled: patch.dailySummaryEnabled ?? current.dailySummaryEnabled,
    dailySummaryTime: patch.dailySummaryTime ?? current.dailySummaryTime,
    events: { ...current.events },
  };

  if (patch.eventKey) {
    const prev = current.events[patch.eventKey] ?? { email: true, inApp: true };
    next.events[patch.eventKey] = {
      email: patch.eventEmail ?? prev.email,
      inApp: patch.eventInApp ?? prev.inApp,
    };
  }

  const res = await saveNotificationPreferences(next);
  if (!res.ok) return res;
  refreshNotifications();
  return { ok: true };
}
