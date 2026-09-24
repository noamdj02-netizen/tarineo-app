"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { RESOURCE_CATEGORIES } from "@/lib/design-data/resources";
import { safeUrl } from "@/lib/projects/types";
import type { Resource } from "@/lib/resources/types";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function addResource(input: {
  name: string;
  url: string;
  category: string;
  tags: string;
  note: string;
}): Promise<Result<{ resource: Resource }>> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté" };

  const name = clean(input.name, 120);
  if (!name) return { ok: false, error: "Donne un nom à la ressource." };
  const rawUrl = clean(input.url, 1000);
  const url = rawUrl ? safeUrl(rawUrl) : "";
  if (url === null) return { ok: false, error: "Le lien doit commencer par https://" };
  const category = (RESOURCE_CATEGORIES as readonly string[]).includes(input.category)
    ? input.category
    : RESOURCE_CATEGORIES[0];
  const tags = clean(input.tags, 300)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);

  const { data, error } = await db.supabase
    .from("resources")
    .insert({
      user_id: db.user.id,
      name,
      url,
      category,
      tags,
      note: clean(input.note, 1000),
      source: "moi",
    })
    .select("id, name, url, category, tags, note, source, verified, notion_url")
    .single();
  if (error || !data) return { ok: false, error: "Enregistrement impossible, réessaie." };
  revalidatePath("/ressources");
  revalidatePath("/accueil");
  return { ok: true, resource: data };
}

/** Seules tes ressources (« Ajout perso ») peuvent être supprimées, comme dans l'original. */
export async function deleteResource(id: string): Promise<Result> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté" };
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "Identifiant invalide" };
  const { error } = await db.supabase
    .from("resources")
    .delete()
    .eq("id", id)
    .eq("user_id", db.user.id)
    .eq("source", "moi");
  if (error) return { ok: false, error: "Suppression impossible." };
  revalidatePath("/ressources");
  return { ok: true };
}
