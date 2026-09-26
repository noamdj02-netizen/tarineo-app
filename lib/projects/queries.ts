import "server-only";
import { getDb } from "@/lib/db";
import type {
  Feature,
  LogEntry,
  ProjectAssetItem,
  ProjectFull,
  ProjectNoteItem,
  ProjectSchemaLink,
  ProjectSummary,
  Task,
} from "./types";

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

export async function listProjectMedia(projectId: string): Promise<{
  schemas: ProjectSchemaLink[];
  assets: ProjectAssetItem[];
  notes: ProjectNoteItem[];
}> {
  const empty = { schemas: [], assets: [], notes: [] };
  const db = await getDb();
  if (!db) return empty;
  const [schemas, assets, notes] = await Promise.all([
    db.supabase
      .from("project_schemas")
      .select("id, title, kind")
      .eq("user_id", db.user.id)
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false }),
    db.supabase
      .from("project_assets")
      .select("id, title, html, theme_id, kind, created_at")
      .eq("user_id", db.user.id)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false }),
    db.supabase
      .from("project_notes")
      .select("id, title, content, source, created_at")
      .eq("user_id", db.user.id)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  return {
    schemas: (schemas.data ?? []) as ProjectSchemaLink[],
    assets: (assets.data ?? []) as ProjectAssetItem[],
    notes: (notes.data ?? []) as ProjectNoteItem[],
  };
}
