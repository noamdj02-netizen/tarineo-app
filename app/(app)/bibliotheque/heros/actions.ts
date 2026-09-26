"use server";

import { getPlan } from "@/lib/billing/plan";
import { getDb } from "@/lib/db";
import { defaultValues, landingBrief } from "@/lib/heroes/apply";
import { getHero } from "@/lib/heroes/catalog";
import { data } from "@/lib/mcp/data";
import { revalidatePath } from "next/cache";

export async function attachLanding(input: {
  projectId: string;
  slug: string;
  values?: Record<string, string>;
}) {
  const db = await getDb();
  if (!db) return { ok: false as const, error: "Pas connecté." };
  const hero = getHero(input.slug);
  if (!hero) return { ok: false as const, error: "Landing inconnue." };
  if (hero.acces === "pro") {
    const plan = await getPlan();
    if (!(plan && (plan.plan !== "free" || plan.isFreeTrial))) {
      return { ok: false as const, error: "Landing Pro — passe Pro pour l’ajouter." };
    }
  }
  const values = { ...defaultValues(hero), ...input.values };
  try {
    const row = await data.attachComponent(db.user.id, {
      projectId: input.projectId,
      title: `${values.MARQUE} · ${hero.nom}`,
      html: landingBrief(hero, values),
      themeId: hero.slug,
      kind: "landing",
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
