import "server-only";
import { getDb } from "@/lib/db";
import type { Resource } from "./types";

/** Toutes les ressources : les tiennes d'abord (plus récentes en haut), puis les « curated ». */
export async function listResources(): Promise<Resource[]> {
  const db = await getDb();
  if (!db) return [];
  const { data, error } = await db.supabase
    .from("resources")
    .select("id, name, url, category, tags, note, source, verified, notion_url")
    .eq("user_id", db.user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Lecture des ressources : ${error.message}`);
  return data ?? [];
}
