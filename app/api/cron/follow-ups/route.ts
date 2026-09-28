import { NextResponse } from "next/server";
import { cronBearerAuthorized } from "@/lib/metier/cron-auth";
import { processScheduledFollowUps } from "@/lib/metier/follow-up-queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!cronBearerAuthorized(req.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  try {
    const result = await processScheduledFollowUps();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[cron] follow-ups", err);
    return NextResponse.json({ error: "Traitement interrompu." }, { status: 500 });
  }
}
