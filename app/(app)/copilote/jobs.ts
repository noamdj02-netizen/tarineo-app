"use server";

import { runDebriefFocus, runNextActionJob, runSchemaParcoursJob } from "@/lib/assistant/jobs";
import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type CopilotJobId = "debrief-focus" | "next-action" | "schema-parcours";

export async function runCopilotJob(job: CopilotJobId) {
  const db = await getDb();
  if (!db) return { ok: false as const, error: "Pas connecté." };
  try {
    const result =
      job === "debrief-focus"
        ? await runDebriefFocus(db.user.id)
        : job === "next-action"
          ? await runNextActionJob(db.user.id)
          : await runSchemaParcoursJob(db.user.id);
    if (result.ok) {
      revalidatePath("/copilote");
      revalidatePath("/projets");
      revalidatePath("/automatisations");
      revalidatePath("/accueil");
    }
    return result;
  } catch (err) {
    console.error("[copilot-job]", err);
    return { ok: false as const, error: "Le job n’a pas abouti. Réessaie." };
  }
}
