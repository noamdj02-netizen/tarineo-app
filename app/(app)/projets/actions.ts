"use server";

import { revalidatePath } from "next/cache";
import { getDb, type Db } from "@/lib/db";
import {
  FEATURE_ORDER,
  slugify,
  type FeatureStatus,
  type ProjectPatch,
  type ProjectStatus,
} from "@/lib/projects/types";

type Result = { ok: true } | { ok: false; error: string };
const MAX_TEXT = 2000;

function fail(error: string): Result {
  return { ok: false, error };
}

async function requireDb(): Promise<Db> {
  const db = await getDb();
  if (!db) throw new Error("Pas connecté");
  return db;
}

/** Vérifie que le projet appartient bien à l'utilisateur (indispensable en accès libre). */
async function ownProject(db: Db, projectId: string) {
  const { data } = await db.supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", db.user.id)
    .maybeSingle();
  return Boolean(data);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(...ids: string[]) {
  return ids.every((id) => typeof id === "string" && UUID.test(id));
}

function clean(v: unknown, max = MAX_TEXT) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function refresh() {
  revalidatePath("/projets", "layout");
  revalidatePath("/accueil");
}

async function run(fn: (db: Db) => Promise<Result>): Promise<Result> {
  try {
    return await fn(await requireDb());
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Erreur inconnue");
  }
}

// ─── Projet ─────────────────────────────────────────────────────────────────

export async function updateProject(projectId: string, patch: ProjectPatch): Promise<Result> {
  return run(async (db) => {
    if (!isUuid(projectId)) return fail("Identifiant invalide");
    const row: ProjectPatch = {};
    if (patch.stage !== undefined) {
      const s = Math.round(Number(patch.stage));
      if (!(s >= 1 && s <= 6)) return fail("Étape invalide");
      row.stage = s;
    }
    if (patch.status !== undefined) {
      if (!(["focus", "pause"] as ProjectStatus[]).includes(patch.status))
        return fail("Statut invalide");
      row.status = patch.status;
    }
    for (const k of ["next", "site", "github", "figma", "notion"] as const) {
      if (patch[k] !== undefined) row[k] = clean(patch[k], 1000);
    }
    if (patch.notes !== undefined) row.notes = clean(patch.notes, 20000);

    const { error } = await db.supabase
      .from("projects")
      .update(row)
      .eq("id", projectId)
      .eq("user_id", db.user.id);
    if (error) return fail(error.message);
    refresh();
    return { ok: true };
  });
}

export async function createProject(
  name: string,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  try {
    const db = await requireDb();
    const title = clean(name, 80);
    const base = slugify(title);
    if (!title || !base) return { ok: false, error: "Donne un nom au projet" };

    // slug libre : opterieur, opterieur-2, opterieur-3…
    const { data: taken } = await db.supabase
      .from("projects")
      .select("slug, sort_order")
      .eq("user_id", db.user.id);
    const slugs = new Set((taken ?? []).map((p) => p.slug));
    let slug = base;
    for (let i = 2; slugs.has(slug); i++) slug = `${base}-${i}`;
    const sortOrder = Math.max(0, ...(taken ?? []).map((p) => p.sort_order)) + 1;

    const { error } = await db.supabase.from("projects").insert({
      user_id: db.user.id,
      slug,
      name: title,
      status: "pause",
      stage: 1,
      sort_order: sortOrder,
    });
    if (error) return { ok: false, error: error.message };
    refresh();
    return { ok: true, slug };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

// ─── Fonctionnalités ────────────────────────────────────────────────────────

export async function setFeatureStatus(
  projectId: string,
  featureId: string,
  status: FeatureStatus,
): Promise<Result> {
  return run(async (db) => {
    if (!isUuid(projectId, featureId)) return fail("Identifiant invalide");
    if (!FEATURE_ORDER.includes(status)) return fail("Statut invalide");
    if (!(await ownProject(db, projectId))) return fail("Projet introuvable");
    const { error } = await db.supabase
      .from("project_features")
      .update({ status })
      .eq("id", featureId)
      .eq("project_id", projectId);
    if (error) return fail(error.message);
    refresh();
    return { ok: true };
  });
}

export async function addFeature(projectId: string, title: string, id: string): Promise<Result> {
  return run(async (db) => {
    if (!isUuid(projectId, id)) return fail("Identifiant invalide");
    const t = clean(title, 300);
    if (!t) return fail("Texte vide");
    if (!(await ownProject(db, projectId))) return fail("Projet introuvable");
    const { count } = await db.supabase
      .from("project_features")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId);
    const { error } = await db.supabase
      .from("project_features")
      .insert({ id, project_id: projectId, title: t, status: "afaire", position: count ?? 0 });
    if (error) return fail(error.message);
    refresh();
    return { ok: true };
  });
}

export async function deleteFeature(projectId: string, featureId: string): Promise<Result> {
  return run(async (db) => {
    if (!isUuid(projectId, featureId)) return fail("Identifiant invalide");
    if (!(await ownProject(db, projectId))) return fail("Projet introuvable");
    const { error } = await db.supabase
      .from("project_features")
      .delete()
      .eq("id", featureId)
      .eq("project_id", projectId);
    if (error) return fail(error.message);
    refresh();
    return { ok: true };
  });
}

// ─── Tâches ─────────────────────────────────────────────────────────────────

export async function toggleTask(projectId: string, taskId: string, done: boolean): Promise<Result> {
  return run(async (db) => {
    if (!isUuid(projectId, taskId)) return fail("Identifiant invalide");
    if (!(await ownProject(db, projectId))) return fail("Projet introuvable");
    const { error } = await db.supabase
      .from("project_tasks")
      .update({ done: Boolean(done) })
      .eq("id", taskId)
      .eq("project_id", projectId);
    if (error) return fail(error.message);
    refresh();
    return { ok: true };
  });
}

export async function addTask(projectId: string, title: string, id: string): Promise<Result> {
  return run(async (db) => {
    if (!isUuid(projectId, id)) return fail("Identifiant invalide");
    const t = clean(title, 300);
    if (!t) return fail("Texte vide");
    if (!(await ownProject(db, projectId))) return fail("Projet introuvable");
    const { count } = await db.supabase
      .from("project_tasks")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId);
    const { error } = await db.supabase
      .from("project_tasks")
      .insert({ id, project_id: projectId, title: t, done: false, position: count ?? 0 });
    if (error) return fail(error.message);
    refresh();
    return { ok: true };
  });
}

export async function deleteTask(projectId: string, taskId: string): Promise<Result> {
  return run(async (db) => {
    if (!isUuid(projectId, taskId)) return fail("Identifiant invalide");
    if (!(await ownProject(db, projectId))) return fail("Projet introuvable");
    const { error } = await db.supabase
      .from("project_tasks")
      .delete()
      .eq("id", taskId)
      .eq("project_id", projectId);
    if (error) return fail(error.message);
    refresh();
    return { ok: true };
  });
}

// ─── Journal ────────────────────────────────────────────────────────────────

export async function addLog(
  projectId: string,
  text: string,
  date: string,
  id: string,
): Promise<Result> {
  return run(async (db) => {
    if (!isUuid(projectId, id)) return fail("Identifiant invalide");
    const t = clean(text, 1000);
    if (!t) return fail("Texte vide");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("Date invalide");
    if (!(await ownProject(db, projectId))) return fail("Projet introuvable");
    const { error } = await db.supabase
      .from("project_log")
      .insert({ id, project_id: projectId, text: t, date });
    if (error) return fail(error.message);
    refresh();
    return { ok: true };
  });
}
