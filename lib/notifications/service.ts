import "server-only";
import { getDb } from "@/lib/db";
import { getNotificationPreferences } from "@/lib/settings/notification-store";
import type { NotificationPreferences } from "@/lib/settings/notification-preferences";
import type {
  AppNotification,
  CreateNotificationInput,
  NotificationType,
} from "@/lib/notifications/types";
import { sendPushToUser } from "@/lib/notifications/push";

const mem = new Map<string, AppNotification[]>();

function channelAllows(
  prefs: NotificationPreferences,
  channel: CreateNotificationInput["preferenceChannel"],
  kind: "inApp" | "push",
) {
  if (!channel) return true;
  const map = {
    quotes: kind === "inApp" ? prefs.inAppQuotes : prefs.pushQuotes,
    invoices: kind === "inApp" ? prefs.inAppInvoices : prefs.pushInvoices,
    supplier: kind === "inApp" ? prefs.inAppSupplierIncreases : prefs.pushSupplierIncreases,
    followups: kind === "inApp" ? prefs.inAppFollowups : prefs.pushFollowups,
    copilot: kind === "inApp" ? prefs.inAppCopilot : prefs.pushCopilot,
    projects: kind === "inApp" ? prefs.inAppProjects : prefs.pushProjects,
  } as const;
  return Boolean(map[channel]);
}

function rowToNotification(row: Record<string, unknown>): AppNotification {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    organizationId: String(row.organization_id),
    type: row.type as NotificationType,
    title: String(row.title),
    message: String(row.message ?? ""),
    priority: (row.priority as AppNotification["priority"]) ?? "normal",
    read: Boolean(row.read),
    archived: Boolean(row.archived),
    createdAt: String(row.created_at),
    readAt: row.read_at ? String(row.read_at) : null,
    actionUrl: String(row.action_url ?? ""),
    entityType: String(row.entity_type ?? ""),
    entityId: String(row.entity_id ?? ""),
    metadata: (row.metadata && typeof row.metadata === "object" ? row.metadata : {}) as Record<
      string,
      unknown
    >,
    idempotencyKey: String(row.idempotency_key),
  };
}

/**
 * Crée une notification (idempotente).
 * Ne fait jamais échouer l’appelant métier : erreurs loguées.
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<{ ok: true; created: boolean; notification?: AppNotification } | { ok: false }> {
  try {
    const db = await getDb();
    const userId = db?.user.id ?? "local";
    const prefs = await getNotificationPreferences();

    const allowInApp = channelAllows(prefs, input.preferenceChannel, "inApp");
    if (!allowInApp) return { ok: true, created: false };

    const existing = mem.get(userId) ?? [];
    if (existing.some((n) => n.idempotencyKey === input.idempotencyKey)) {
      return { ok: true, created: false };
    }

    const draft: AppNotification = {
      id: `n-${Math.random().toString(36).slice(2, 10)}`,
      userId,
      organizationId: userId,
      type: input.type,
      title: input.title.slice(0, 200),
      message: input.message.slice(0, 2000),
      priority: input.priority ?? "normal",
      read: false,
      archived: false,
      createdAt: new Date().toISOString(),
      readAt: null,
      actionUrl: input.actionUrl ?? "",
      entityType: input.entityType ?? "",
      entityId: input.entityId ?? "",
      metadata: input.metadata ?? {},
      idempotencyKey: input.idempotencyKey.slice(0, 180),
    };

    if (!db) {
      mem.set(userId, [draft, ...existing].slice(0, 200));
      return { ok: true, created: true, notification: draft };
    }

    const { data, error } = await db.supabase
      .from("notifications")
      .upsert(
        {
          user_id: db.user.id,
          organization_id: db.user.id,
          type: draft.type,
          title: draft.title,
          message: draft.message,
          priority: draft.priority,
          action_url: draft.actionUrl,
          entity_type: draft.entityType,
          entity_id: draft.entityId,
          metadata: draft.metadata,
          idempotency_key: draft.idempotencyKey,
        },
        { onConflict: "user_id,idempotency_key", ignoreDuplicates: true },
      )
      .select("*")
      .maybeSingle();

    if (error) {
      if (/notifications|relation|column/i.test(error.message)) {
        mem.set(userId, [draft, ...existing].slice(0, 200));
        return { ok: true, created: true, notification: draft };
      }
      // Conflit unique = déjà existant
      if (/duplicate|unique/i.test(error.message)) {
        return { ok: true, created: false };
      }
      console.error("[createNotification]", error.message);
      return { ok: false };
    }

    const created = Boolean(data);
    const notification = data ? rowToNotification(data as Record<string, unknown>) : draft;

    if (created) {
      const allowPush = prefs.pushEnabled && channelAllows(prefs, input.preferenceChannel, "push");
      if (allowPush) {
        void sendPushToUser(db.user.id, {
          title: notification.title,
          body: notification.message,
          url: notification.actionUrl || "/notifications",
          tag: notification.idempotencyKey,
        }).catch((err) => console.error("[push]", err));
      }
    }

    return { ok: true, created, notification: created ? notification : undefined };
  } catch (err) {
    console.error("[createNotification]", err);
    return { ok: false };
  }
}

export async function listNotifications(opts?: {
  unreadOnly?: boolean;
  type?: NotificationType | "actions" | "alerts" | "ai";
  limit?: number;
}): Promise<AppNotification[]> {
  const db = await getDb();
  const userId = db?.user.id ?? "local";
  const limit = opts?.limit ?? 50;

  if (!db) {
    let list = mem.get(userId) ?? [];
    if (opts?.unreadOnly) list = list.filter((n) => !n.read);
    list = filterByBucket(list, opts?.type);
    return list.slice(0, limit);
  }

  let q = db.supabase
    .from("notifications")
    .select("*")
    .eq("user_id", db.user.id)
    .eq("archived", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (opts?.unreadOnly) q = q.eq("read", false);

  const { data, error } = await q;
  if (error) {
    if (/notifications|relation/i.test(error.message)) {
      let list = mem.get(userId) ?? [];
      if (opts?.unreadOnly) list = list.filter((n) => !n.read);
      return filterByBucket(list, opts?.type).slice(0, limit);
    }
    console.error("[listNotifications]", error.message);
    return [];
  }
  const list = (data ?? []).map((r) => rowToNotification(r as Record<string, unknown>));
  return filterByBucket(list, opts?.type);
}

function filterByBucket(
  list: AppNotification[],
  type?: NotificationType | "actions" | "alerts" | "ai",
) {
  if (!type) return list;
  if (type === "actions") {
    return list.filter((n) =>
      ["client_followup", "quote_to_send", "quote_ready", "invoice_anomaly"].includes(n.type),
    );
  }
  if (type === "alerts") {
    return list.filter((n) =>
      ["supplier_price_increase", "invoice_anomaly", "payment_alert", "ai_alert"].includes(n.type),
    );
  }
  if (type === "ai") {
    return list.filter((n) => n.type === "ai_alert" || n.type === "document_analyzed");
  }
  return list.filter((n) => n.type === type);
}

export async function countUnreadNotifications(): Promise<number> {
  const db = await getDb();
  const userId = db?.user.id ?? "local";
  if (!db) return (mem.get(userId) ?? []).filter((n) => !n.read).length;

  const { count, error } = await db.supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", db.user.id)
    .eq("read", false)
    .eq("archived", false);

  if (error) {
    if (/notifications|relation/i.test(error.message)) {
      return (mem.get(userId) ?? []).filter((n) => !n.read).length;
    }
    return 0;
  }
  return count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  const db = await getDb();
  const userId = db?.user.id ?? "local";
  if (!db) {
    const list = mem.get(userId) ?? [];
    mem.set(
      userId,
      list.map((n) =>
        n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n,
      ),
    );
    return;
  }
  await db.supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("user_id", db.user.id)
    .eq("id", id);
}

export async function markAllNotificationsRead(): Promise<void> {
  const db = await getDb();
  const userId = db?.user.id ?? "local";
  if (!db) {
    mem.set(
      userId,
      (mem.get(userId) ?? []).map((n) => ({ ...n, read: true, readAt: new Date().toISOString() })),
    );
    return;
  }
  await db.supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("user_id", db.user.id)
    .eq("read", false);
}
