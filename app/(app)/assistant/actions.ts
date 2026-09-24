"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";

/** Efface tout l'historique du chat de l'utilisateur. */
export async function clearChat(): Promise<{ ok: boolean }> {
  const db = await getDb();
  if (!db) return { ok: false };
  const { error } = await db.supabase.from("chat_messages").delete().eq("user_id", db.user.id);
  if (error) return { ok: false };
  revalidatePath("/assistant");
  return { ok: true };
}
