import { NextResponse } from "next/server";
import { lookupCompany } from "@/lib/company/company-lookup";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

/** POST { query: string } — recherche entreprise (serveur, session requise). */
export async function POST(req: Request) {
  const db = await getDb();
  if (!db) {
    return NextResponse.json({ status: "error", message: "Connexion requise." }, { status: 401 });
  }

  let body: { query?: unknown };
  try {
    body = (await req.json()) as { query?: unknown };
  } catch {
    return NextResponse.json({ status: "error", message: "Requête invalide." }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query : "";
  if (!query.trim()) {
    return NextResponse.json(
      { status: "error", message: "Indiquez un nom ou un site web." },
      { status: 400 },
    );
  }

  const result = await lookupCompany(query);
  return NextResponse.json(result);
}
