"use server";

import { revalidatePath } from "next/cache";
import { normalizeCritique, type CritiqueState } from "@/lib/audit/critique";
import { isFrameState, normalizeFrames, type FrameState } from "@/lib/audit/score";
import { getDb } from "@/lib/db";

type Result = { ok: true } | { ok: false; error: string };

const UUID = /^[0-9a-f-]{36}$/i;

export async function saveAuditFrames(
  projectId: string,
  frames: FrameState[],
): Promise<Result> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  if (!UUID.test(projectId)) return { ok: false, error: "Projet invalide." };
  const clean = normalizeFrames(frames).map((s) => (isFrameState(s) ? s : "unk"));
  const { error } = await db.supabase
    .from("projects")
    .update({ audit_frames: clean })
    .eq("id", projectId)
    .eq("user_id", db.user.id);
  if (error) return { ok: false, error: "Score non enregistré." };
  revalidatePath("/audit");
  revalidatePath("/accueil");
  return { ok: true };
}

export async function saveAuditCritique(
  projectId: string,
  critique: CritiqueState,
): Promise<Result> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  if (!UUID.test(projectId)) return { ok: false, error: "Projet invalide." };
  const clean = normalizeCritique(critique);
  const { error } = await db.supabase
    .from("projects")
    .update({ audit_critique: clean })
    .eq("id", projectId)
    .eq("user_id", db.user.id);
  if (error) return { ok: false, error: "Critique non enregistrée." };
  revalidatePath("/audit");
  return { ok: true };
}
