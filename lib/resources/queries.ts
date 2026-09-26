import "server-only";
import { getDb } from "@/lib/db";
import { catalogResources, mergeResourceLists } from "./catalog";
import type { Resource } from "./types";

/** Tes liens d'abord, puis le catalogue (toujours présent, seed ou pas). */
export async function listResources(): Promise<Resource[]> {
  const catalog = catalogResources();
  const db = await getDb();
  if (!db) return catalog;
  const { data, error } = await db.supabase
    .from("resources")
    .select("id, name, url, category, tags, note, source, verified, notion_url")
    .eq("user_id", db.user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Lecture des ressources : ${error.message}`);
  return mergeResourceLists(data ?? [], catalog);
}
