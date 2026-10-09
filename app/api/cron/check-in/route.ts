import { NextResponse } from "next/server";
import { processSignupCheckIns } from "@/lib/email/check-in";
import { cronBearerAuthorized } from "@/lib/metier/cron-auth";

export const dynamic = "force-dynamic";

/** Cron quotidien : mail check-in aux nouveaux inscrits (J+2). */
export async function GET(req: Request) {
  if (!cronBearerAuthorized(req.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  try {
    const result = await processSignupCheckIns();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron] check-in", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "check-in-error" },
      { status: 500 },
    );
  }
}
