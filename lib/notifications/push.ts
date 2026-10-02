import "server-only";
import webpush from "web-push";
import { getDb } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { isOpenAccess } from "@/lib/supabase/config";

export function isWebPushConfigured() {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY?.trim() &&
      process.env.VAPID_PRIVATE_KEY?.trim() &&
      process.env.VAPID_SUBJECT?.trim(),
  );
}

export function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY?.trim() || null;
}

function configureWebPush() {
  if (!isWebPushConfigured()) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!.trim(),
    process.env.VAPID_PUBLIC_KEY!.trim(),
    process.env.VAPID_PRIVATE_KEY!.trim(),
  );
  return true;
}

export async function savePushSubscription(input: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const db = await getDb();
  if (!db) return { ok: false as const, error: "Pas connecté." };
  if (!input.endpoint || !input.keys?.p256dh || !input.keys?.auth) {
    return { ok: false as const, error: "Abonnement invalide." };
  }
  const { error } = await db.supabase.from("push_subscriptions").upsert(
    {
      user_id: db.user.id,
      endpoint: input.endpoint.slice(0, 2000),
      p256dh: input.keys.p256dh.slice(0, 200),
      auth: input.keys.auth.slice(0, 200),
      user_agent: "",
      last_used_at: new Date().toISOString(),
    },
    { onConflict: "user_id,endpoint" },
  );
  if (error) {
    if (/push_subscriptions|relation/i.test(error.message)) {
      return { ok: false as const, error: "Push non disponible (migration requise)." };
    }
    return { ok: false as const, error: "Enregistrement impossible." };
  }
  return { ok: true as const };
}

export async function deletePushSubscription(endpoint: string) {
  const db = await getDb();
  if (!db) return;
  await db.supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", db.user.id)
    .eq("endpoint", endpoint);
}

/** Envoi push — jamais bloquant pour le métier. */
export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string; tag?: string },
) {
  if (!configureWebPush()) return { sent: 0, skipped: true as const };

  let client = null as ReturnType<typeof createAdminClient> | null;
  try {
    const db = await getDb();
    if (db && db.user.id === userId) {
      const { data } = await db.supabase
        .from("push_subscriptions")
        .select("id, endpoint, p256dh, auth")
        .eq("user_id", userId);
      return deliver(data ?? [], payload);
    }
    if (!isOpenAccess() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      client = createAdminClient();
      const { data } = await client
        .from("push_subscriptions")
        .select("id, endpoint, p256dh, auth")
        .eq("user_id", userId);
      return deliver(data ?? [], payload);
    }
    return { sent: 0, skipped: true as const };
  } catch (err) {
    console.error("[sendPushToUser]", err);
    return { sent: 0, skipped: false as const };
  }
}

async function deliver(
  rows: { id: string; endpoint: string; p256dh: string; auth: string }[],
  payload: { title: string; body: string; url?: string; tag?: string },
) {
  let sent = 0;
  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/notifications",
    tag: payload.tag || "tarineo",
  });
  for (const row of rows) {
    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        body,
      );
      sent += 1;
    } catch (err: unknown) {
      const status = (err as { statusCode?: number })?.statusCode;
      if (status === 404 || status === 410) {
        const db = await getDb();
        if (db) {
          await db.supabase.from("push_subscriptions").delete().eq("id", row.id);
        }
      } else {
        console.error("[webpush]", status ?? err);
      }
    }
  }
  return { sent, skipped: false as const };
}
