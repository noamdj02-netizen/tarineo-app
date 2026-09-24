"use server";

import { revalidatePath } from "next/cache";
import { limitReached } from "@/lib/billing/plan";
import { getDb, type Db } from "@/lib/db";
import { isSchemaKind } from "@/lib/schemas/agents";
import type { SchemaKind, SchemaRow } from "@/lib/supabase/types";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Même limite que la contrainte SQL (2 Mo). */
const MAX_SCENE = 2_000_000;

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

function cleanTitle(v: unknown) {
  const t = typeof v === "string" ? v.trim().slice(0, 120) : "";
  return t || "Sans titre";
}

export async function createSchema(input: {
  title?: string;
  projectId?: string | null;
  kind?: SchemaKind;
}): Promise<Result<{ id: string }>> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  const projectId = input.projectId || null;
  if (
    projectId &&
    (!UUID.test(projectId) || !(await ownProject(db, projectId)))
  ) {
    return { ok: false, error: "Projet introuvable." };
  }
  const limit = await limitReached(db, "schemas");
  if (limit) return { ok: false, error: limit };
  const kind = isSchemaKind(input.kind) ? input.kind : "libre";
  const { data, error } = await db.supabase
    .from("project_schemas")
    .insert({
      user_id: db.user.id,
      project_id: projectId,
      title: cleanTitle(input.title),
      kind,
    })
    .select("id")
    .single();
  if (error || !data)
    return { ok: false, error: "Création impossible. Réessaie." };
  revalidatePath("/schemas");
  return { ok: true, id: data.id };
}

export async function saveSchemaScene(
  id: string,
  scene: SchemaRow["scene"],
): Promise<Result> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  if (!UUID.test(id) || !Array.isArray(scene?.elements))
    return { ok: false, error: "Schéma invalide." };
  const clean = {
    elements: scene.elements,
    appState: scene.appState ?? {},
    files: scene.files ?? {},
  };
  if (JSON.stringify(clean).length > MAX_SCENE) {
    return {
      ok: false,
      error: "Schéma trop gros (2 Mo max) : retire des images.",
    };
  }
  const { error } = await db.supabase
    .from("project_schemas")
    .update({ scene: clean })
    .eq("id", id)
    .eq("user_id", db.user.id);
  return error
    ? { ok: false, error: "Pas enregistré. Vérifie ta connexion." }
    : { ok: true };
}

export async function renameSchema(id: string, title: string): Promise<Result> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  if (!UUID.test(id)) return { ok: false, error: "Schéma invalide." };
  const { error } = await db.supabase
    .from("project_schemas")
    .update({ title: cleanTitle(title) })
    .eq("id", id)
    .eq("user_id", db.user.id);
  if (error) return { ok: false, error: "Renommage impossible." };
  revalidatePath("/schemas");
  return { ok: true };
}

export async function deleteSchema(id: string): Promise<Result> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  if (!UUID.test(id)) return { ok: false, error: "Schéma invalide." };
  const { error } = await db.supabase
    .from("project_schemas")
    .delete()
    .eq("id", id)
    .eq("user_id", db.user.id);
  if (error) return { ok: false, error: "Suppression impossible." };
  revalidatePath("/schemas");
  return { ok: true };
}
