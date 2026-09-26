"use server";

import { COMPONENTS } from "@/lib/design-data/components";
import { getDb } from "@/lib/db";
import { data } from "@/lib/mcp/data";
import { revalidatePath } from "next/cache";

export async function attachKitComponent(input: {
  projectId: string;
  name: string;
  themeId?: string;
}) {
  const db = await getDb();
  if (!db) return { ok: false as const, error: "Pas connecté." };
  const comp = COMPONENTS.find((c) => c.n === input.name);
  if (!comp) return { ok: false as const, error: "Composant inconnu." };
  try {
    const row = await data.attachComponent(db.user.id, {
      projectId: input.projectId,
      title: comp.n,
      html: comp.h,
      themeId: input.themeId,
    });
    const project = await data.getProject(db.user.id, input.projectId);
    revalidatePath("/projets");
    if (project?.slug) revalidatePath(`/projets/${project.slug}`);
    return {
      ok: true as const,
      href: project?.slug ? `/projets/${project.slug}` : "/projets",
      id: row.id,
    };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Pas collé.",
    };
  }
}

export async function deleteProjectAsset(id: string) {
  const db = await getDb();
  if (!db) return { ok: false as const };
  const { error } = await db.supabase.from("project_assets").delete().eq("id", id).eq("user_id", db.user.id);
  if (!error) {
    revalidatePath("/projets");
    revalidatePath("/projets", "layout");
  }
  return { ok: !error };
}
