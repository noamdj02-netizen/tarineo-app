import "server-only";
import { getDb } from "@/lib/db";

/** Session cookie Navpit (Supabase Auth). */
export async function getCurrentUserId(): Promise<string | null> {
  const db = await getDb();
  return db?.user.id ?? null;
}
