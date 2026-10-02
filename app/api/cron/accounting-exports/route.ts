import { NextResponse } from "next/server";
import { processDueAccountingExports } from "@/lib/metier/accounting-export-queries";
import { cronBearerAuthorized } from "@/lib/metier/cron-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!cronBearerAuthorized(req.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  try {
    const result = await processDueAccountingExports();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[cron] accounting-exports", err);
    return NextResponse.json({ error: "Traitement interrompu." }, { status: 500 });
  }
}
