"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { buildLandingPlan, taskTitle } from "@/lib/prelanding/plan";
import { findTemplate } from "@/lib/prelanding/templates";
import { THEMES } from "@/lib/design-data/themes";

export type ApplyResult =
  | { ok: true; projectSlug: string; projectName: string; sections: number }
  | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Ajoute la structure d'une pre-landing au projet : une tâche par section + une ligne de journal.
 * N'écrase rien : les tâches existantes restent, les nouvelles s'ajoutent à la fin.
 */
export async function applyPreLanding(templateId: string, projectId: string): Promise<ApplyResult> {
  try {
    const template = findTemplate(templateId);
    if (!template) return { ok: false, error: "Template introuvable" };
    if (!UUID.test(projectId)) return { ok: false, error: "Projet invalide" };

    const db = await getDb();
    if (!db) return { ok: false, error: "Connecte-toi pour utiliser un template" };

    const { data: project } = await db.supabase
      .from("projects")
      .select("id, slug, name")
      .eq("id", projectId)
      .eq("user_id", db.user.id)
      .maybeSingle();
    if (!project) return { ok: false, error: "Projet introuvable" };

    const plan = buildLandingPlan(template);
    const { count } = await db.supabase
      .from("project_tasks")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId);
    const start = count ?? 0;

    const { error: taskError } = await db.supabase.from("project_tasks").insert(
      plan.sections.map((_, i) => ({
        id: randomUUID(),
        project_id: projectId,
        title: taskTitle(plan, i),
        done: false,
        position: start + i,
      })),
    );
    if (taskError) return { ok: false, error: taskError.message };

    const theme = THEMES.find((t) => t.id === plan.theme)?.n ?? plan.theme;
    const { error: logError } = await db.supabase.from("project_log").insert({
      id: randomUUID(),
      project_id: projectId,
      date: new Date().toISOString().slice(0, 10),
      text: `Pre-landing « ${plan.templateName} » ajoutée : ${plan.sections.length} sections (thème conseillé : ${theme})`,
    });
    if (logError) return { ok: false, error: logError.message };

    revalidatePath("/projets", "layout");
    revalidatePath("/accueil");
    return { ok: true, projectSlug: project.slug, projectName: project.name, sections: plan.sections.length };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}
