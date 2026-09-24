"use server";

import { isOwner } from "@/lib/billing/plan";
import { getDb } from "@/lib/db";
import { PRESETS } from "@/lib/design-data/assistant";

export type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

/** Questions prêtes pour les nouveaux comptes (PRESETS cite les projets du créateur). */
const GENERIC_PRESETS = [
  "Quelle est ma priorité cette semaine ?",
  "Rédige un mail de relance pour un client",
  "Écris le prompt Cursor du hero de mon projet en Focus",
  "5 titres de hero pour mon projet en Focus",
  "Structure ma landing, frame par frame",
];

/** Chargé à la première ouverture du panneau : 50 derniers messages + questions prêtes. */
export async function loadAssistant(): Promise<{ history: ChatMessage[]; presets: string[] }> {
  const db = await getDb();
  if (!db) return { history: [], presets: GENERIC_PRESETS };
  const { data } = await db.supabase
    .from("chat_messages")
    .select("id, role, content")
    .eq("user_id", db.user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  return {
    history: (data ?? []).reverse(),
    presets: isOwner(db.user.email) ? PRESETS : GENERIC_PRESETS,
  };
}

/** Efface tout l'historique du chat de l'utilisateur. */
export async function clearChat(): Promise<{ ok: boolean }> {
  const db = await getDb();
  if (!db) return { ok: false };
  const { error } = await db.supabase.from("chat_messages").delete().eq("user_id", db.user.id);
  return { ok: !error };
}
