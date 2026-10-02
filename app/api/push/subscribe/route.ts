import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  deletePushSubscription,
  getVapidPublicKey,
  isWebPushConfigured,
  savePushSubscription,
} from "@/lib/notifications/push";
import { saveNotificationPreferences } from "@/lib/settings/notification-store";
import { getNotificationPreferences } from "@/lib/settings/notification-store";

export const runtime = "nodejs";

const Body = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({
    p256dh: z.string().min(1).max(200),
    auth: z.string().min(1).max(200),
  }),
});

export async function GET() {
  return NextResponse.json({
    configured: isWebPushConfigured(),
    publicKey: getVapidPublicKey(),
  });
}

export async function POST(req: Request) {
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  if (!isWebPushConfigured()) {
    return NextResponse.json(
      { error: "Push non configuré (clés VAPID manquantes)." },
      { status: 503 },
    );
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Abonnement invalide." }, { status: 400 });
  }
  const res = await savePushSubscription(parsed.data);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  const prefs = await getNotificationPreferences();
  await saveNotificationPreferences({ ...prefs, pushEnabled: true });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";
  if (endpoint) await deletePushSubscription(endpoint);
  const prefs = await getNotificationPreferences();
  await saveNotificationPreferences({ ...prefs, pushEnabled: false });
  return NextResponse.json({ ok: true });
}
