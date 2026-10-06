import { NextResponse } from "next/server";
import { cronBearerAuthorized } from "@/lib/metier/cron-auth";
import { autoScheduleDueQuoteFollowUps } from "@/lib/automation/handlers/quote-followup";
import { processScheduledFollowUps } from "@/lib/metier/follow-up-queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!cronBearerAuthorized(req.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  let schedule: Awaited<ReturnType<typeof autoScheduleDueQuoteFollowUps>> & { error?: string } = {
    scheduled: 0,
    skipped: 0,
    users: 0,
  };
  try {
    schedule = await autoScheduleDueQuoteFollowUps();
  } catch (err) {
    const message = err instanceof Error ? err.message : "schedule-error";
    console.error("[cron] follow-ups phase A", err);
    schedule = { ...schedule, error: message };
  }

  try {
    const send = await processScheduledFollowUps();
    return NextResponse.json({ schedule, send });
  } catch (err) {
    console.error("[cron] follow-ups phase B", err);
    return NextResponse.json(
      { schedule, send: { error: err instanceof Error ? err.message : "send-error" } },
      { status: 500 },
    );
  }
}
