import "server-only";
import { getDb } from "@/lib/db";
import type { Feature, LogEntry, ProjectFull, ProjectSummary, Task } from "./types";

type CardRow = Omit<
  ProjectSummary,
  "featuresDone" | "featuresTotal" | "tasksDone" | "tasksTotal"
> & {
  project_features: { status: string }[] | null;
  project_tasks: { done: boolean }[] | null;
};

type FullRow = Omit<ProjectFull, "features" | "tasks" | "log"> & {
  project_features: Feature[] | null;
  project_tasks: Task[] | null;
  project_log: LogEntry[] | null;
};

const CARD_COLUMNS =
  "id, slug, name, description, status, stage, next, site, github, figma, notion, theme, project_features(status), project_tasks(done)";

/** Tous les projets de l'utilisateur, avec leurs compteurs, dans l'ordre choisi. */
export async function listProjects(): Promise<ProjectSummary[]> {
  const db = await getDb();
  if (!db) return [];
  const { data, error } = await db.supabase
    .from("projects")
    .select(CARD_COLUMNS)
    .eq("user_id", db.user.id)
    .order("sort_order")
    .order("name");
  if (error) throw new Error(`Lecture des projets : ${error.message}`);

  // les types générés à la main ne décrivent pas les jointures : on précise la forme
  return ((data ?? []) as unknown as CardRow[]).map(({ project_features, project_tasks, ...p }) => {
    const features = project_features ?? [];
    const tasks = project_tasks ?? [];
    return {
      ...p,
      featuresDone: features.filter((f) => f.status === "fait").length,
      featuresTotal: features.length,
      tasksDone: tasks.filter((t) => t.done).length,
      tasksTotal: tasks.length,
    };
  });
}

/** Un projet complet (fiche détaillée), ou null s'il n'existe pas pour cet utilisateur. */
export async function getProject(slug: string): Promise<ProjectFull | null> {
  const db = await getDb();
  if (!db) return null;
  const { data, error } = await db.supabase
    .from("projects")
    .select(
      "id, slug, name, description, status, stage, next, site, github, figma, notion, theme, partner, pitch, target, problem, business, stack, team, risks, notes, updated_at, project_features(id, title, status, position), project_tasks(id, title, done, position), project_log(id, date, text, created_at)",
    )
    .eq("user_id", db.user.id)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Lecture du projet : ${error.message}`);
  if (!data) return null;

  const { project_features, project_tasks, project_log, ...p } = data as unknown as FullRow;
  const byPos = <T extends { position: number }>(a: T, b: T) => a.position - b.position;
  return {
    ...p,
    business: (p.business ?? {}) as Record<string, string>,
    features: [...(project_features ?? [])].sort(byPos),
    tasks: [...(project_tasks ?? [])].sort(byPos),
    // le plus récent en haut, comme le HTML d'origine
    log: [...(project_log ?? [])].sort(
      (a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at),
    ),
  };
}
