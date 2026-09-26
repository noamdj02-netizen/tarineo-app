import "server-only";
import { cookies } from "next/headers";
import { isEventName, type EventName } from "@/lib/analytics/catalog";
import { SESSION_COOKIE } from "@/lib/analytics/track-cookie";
import { createAdminClient } from "@/lib/supabase/admin";

export { SESSION_COOKIE };

export type TrackInput = {
  name: EventName;
  userId?: string | null;
  sessionId?: string | null;
  feature?: string;
  projectId?: string | null;
  plan?: string;
  path?: string;
  durationMs?: number | null;
  properties?: Record<string, unknown>;
};

export async function sessionIdFromCookie() {
  try {
    return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}

/** Écrit un événement. Ne casse jamais le produit. */
export async function track(input: TrackInput) {
  if (!isEventName(input.name)) return;
  try {
    const admin = createAdminClient();
    const sessionId = input.sessionId || (await sessionIdFromCookie()) || crypto.randomUUID();
    await admin.from("analytics_events").insert({
      name: input.name,
      user_id: input.userId ?? null,
      session_id: sessionId.slice(0, 80),
      feature: (input.feature ?? "").slice(0, 40),
      project_id: input.projectId ?? null,
      plan: (input.plan ?? "").slice(0, 20),
      path: (input.path ?? "").slice(0, 200),
      duration_ms: input.durationMs ?? null,
      properties: input.properties ?? {},
    });
  } catch (error) {
    console.error("[analytics]", input.name, error);
  }
}
