import { NextResponse } from "next/server";
import { featureFromPath, isEventName } from "@/lib/analytics/catalog";
import { track } from "@/lib/analytics/track";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: {
    name?: unknown;
    sessionId?: unknown;
    feature?: unknown;
    path?: unknown;
    durationMs?: unknown;
    properties?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name : "";
  if (!isEventName(name)) return NextResponse.json({ ok: false }, { status: 400 });
  if (name === "user_signed_up" || name.startsWith("subscription_") || name === "trial_started") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = typeof body.path === "string" ? body.path : "";
  await track({
    name,
    userId: user?.id,
    sessionId: typeof body.sessionId === "string" ? body.sessionId : null,
    feature: typeof body.feature === "string" ? body.feature : featureFromPath(path),
    path,
    durationMs: typeof body.durationMs === "number" ? body.durationMs : null,
    properties: body.properties && typeof body.properties === "object" ? (body.properties as Record<string, unknown>) : {},
  });
  return NextResponse.json({ ok: true });
}
