import { NextResponse } from "next/server";
import { featureFromPath, isEventName } from "@/lib/analytics/catalog";
import { checkAnalyticsEventRateLimit } from "@/lib/analytics/event-rate-limit";
import { track } from "@/lib/analytics/track";
import { clientIpFromHeaders } from "@/lib/site/landing-demo-rate-limit";
import { createClient } from "@/lib/supabase/server";

const MAX_PROPERTIES_KEYS = 24;
const MAX_PATH_LEN = 512;

function sanitizeProperties(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (Object.keys(out).length >= MAX_PROPERTIES_KEYS) break;
    if (typeof k !== "string" || k.length > 64) continue;
    if (v == null || typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[k] = typeof v === "string" ? v.slice(0, 500) : v;
    }
  }
  return out;
}

export async function POST(request: Request) {
  if (!checkAnalyticsEventRateLimit(clientIpFromHeaders(request.headers))) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

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
  const path =
    typeof body.path === "string" ? body.path.slice(0, MAX_PATH_LEN) : "";
  await track({
    name,
    userId: user?.id,
    sessionId: typeof body.sessionId === "string" ? body.sessionId.slice(0, 128) : null,
    feature: typeof body.feature === "string" ? body.feature.slice(0, 64) : featureFromPath(path),
    path,
    durationMs: typeof body.durationMs === "number" ? body.durationMs : null,
    properties: sanitizeProperties(body.properties),
  });
  return NextResponse.json({ ok: true });
}
