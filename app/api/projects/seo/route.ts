import { NextResponse } from "next/server";
import { saveProjectSeo } from "@/app/(app)/projets/actions";
import { getDb } from "@/lib/db";
import { seoFromBusiness } from "@/lib/projects/seo";
import { scoreSite } from "@/lib/seo/site-score";

export const maxDuration = 60;

export async function POST(request: Request) {
  const db = await getDb();
  if (!db) return NextResponse.json({ ok: false, error: "Pas connecté." }, { status: 401 });

  let projectId = "";
  try {
    const body = (await request.json()) as { projectId?: string };
    projectId = typeof body.projectId === "string" ? body.projectId : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const { data } = await db.supabase
    .from("projects")
    .select("id, site, business")
    .eq("id", projectId)
    .eq("user_id", db.user.id)
    .maybeSingle();
  if (!data) return NextResponse.json({ ok: false, error: "Projet introuvable." }, { status: 404 });
  if (!data.site?.trim()) {
    return NextResponse.json({ ok: false, error: "Colle l’URL du site sur la fiche." }, { status: 400 });
  }

  try {
    const snapshot = await scoreSite(data.site);
    const prev = seoFromBusiness(
      data.business && typeof data.business === "object"
        ? (data.business as Record<string, string>)
        : {},
    );
    const saved = await saveProjectSeo(projectId, { snapshot, gaId: prev.gaId, gsc: prev.gsc });
    if (!saved.ok) return NextResponse.json(saved, { status: 400 });
    return NextResponse.json({ ok: true, snapshot });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Score impossible." },
      { status: 502 },
    );
  }
}
