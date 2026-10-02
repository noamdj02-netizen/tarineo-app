import { NextResponse } from "next/server";
import { lookupCompany } from "@/lib/company/company-lookup";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

/** POST /api/company/search — alias documenté de la recherche entreprise. */
export async function POST(req: Request) {
  const db = await getDb();
  if (!db) {
    return NextResponse.json({ success: false, status: "error", message: "Connexion requise." }, { status: 401 });
  }

  let body: { query?: unknown; siret?: unknown };
  try {
    body = (await req.json()) as { query?: unknown; siret?: unknown };
  } catch {
    return NextResponse.json({ success: false, status: "error", message: "Requête invalide." }, { status: 400 });
  }

  const siret = typeof body.siret === "string" ? body.siret.replace(/\D/g, "") : "";
  const query = typeof body.query === "string" ? body.query : "";
  const needle = siret || query;
  if (!needle.trim()) {
    return NextResponse.json(
      { success: false, status: "error", message: "Indiquez un nom ou un SIRET." },
      { status: 400 },
    );
  }

  const result = await lookupCompany(needle);
  if (result.status === "found") {
    return NextResponse.json({ success: true, status: "found", results: [serialize(result.company)] });
  }
  if (result.status === "candidates") {
    return NextResponse.json({
      success: true,
      status: "candidates",
      query: result.query,
      results: result.candidates.map(serialize),
    });
  }
  if (result.status === "not_found") {
    return NextResponse.json({ success: true, status: "not_found", query: result.query, results: [] });
  }
  return NextResponse.json({ success: false, status: "error", message: result.message }, { status: 503 });
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: "Utilisez POST { query } ou { siret }." },
    { status: 405 },
  );
}

function serialize(c: {
  legalName: string | null;
  name: string | null;
  siren: string | null;
  siret: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  activity: string | null;
  activityLabel: string | null;
  legalForm: string | null;
  active: boolean | null;
  siretValid: boolean;
  matchScore: number;
  logoUrl: string | null;
}) {
  return {
    name: c.legalName ?? c.name,
    siren: c.siren,
    siret: c.siret,
    address: c.address,
    postalCode: c.postalCode,
    city: c.city,
    activity: c.activity,
    activityLabel: c.activityLabel,
    legalForm: c.legalForm,
    active: c.active,
    siretValid: c.siretValid,
    matchScore: c.matchScore,
    logoUrl: c.logoUrl,
  };
}
