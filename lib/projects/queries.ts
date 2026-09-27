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

type CardRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: ProjectSummary["status"];
  stage: number;
  next: string;
  next_due_date: string | null;
  next_priority: ProjectSummary["nextPriority"];
  next_estimated_minutes: number | null;
  blocked: boolean;
  blocker_reason: string;
  site: string;
  github: string;
  figma: string;
  notion: string;
  theme: string;
  project_features: { status: string }[] | null;
  project_tasks: { done: boolean }[] | null;
};

type FullRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: ProjectSummary["status"];
  stage: number;
  next: string;
  next_due_date: string | null;
  next_priority: ProjectSummary["nextPriority"];
  next_estimated_minutes: number | null;
  blocked: boolean;
  blocker_reason: string;
  site: string;
  github: string;
  figma: string;
  notion: string;
  theme: string;
  partner: string;
  pitch: string;
  target: string;
  problem: string;
  business: Record<string, string> | null;
  stack: string[] | null;
  team: string[] | null;
  risks: string[] | null;
  notes: string;
  updated_at: string;
  project_features: Feature[] | null;
  project_tasks: Task[] | null;
  project_log: LogEntry[] | null;
};

const CARD_COLUMNS =
  "id, slug, name, description, status, stage, next, next_due_date, next_priority, next_estimated_minutes, blocked, blocker_reason, site, github, figma, notion, theme, project_features(status), project_tasks(done)";

const CARD_COLUMNS_FALLBACK =
  "id, slug, name, description, status, stage, next, site, github, figma, notion, theme, project_features(status), project_tasks(done)";

const FULL_COLUMNS =
  "id, slug, name, description, status, stage, next, next_due_date, next_priority, next_estimated_minutes, blocked, blocker_reason, site, github, figma, notion, theme, partner, pitch, target, problem, business, stack, team, risks, notes, updated_at, project_features(id, title, status, position), project_tasks(id, title, done, position), project_log(id, date, text, created_at)";

const FULL_COLUMNS_FALLBACK =
  "id, slug, name, description, status, stage, next, site, github, figma, notion, theme, partner, pitch, target, problem, business, stack, team, risks, notes, updated_at, project_features(id, title, status, position), project_tasks(id, title, done, position), project_log(id, date, text, created_at)";

function missingNextMeta(message: string) {
  return /next_due_date|next_priority|next_estimated_minutes|blocked|blocker_reason|does not exist/i.test(
    message,
  );
}

function toSummary(row: CardRow): ProjectSummary {
  const features = row.project_features ?? [];
  const tasks = row.project_tasks ?? [];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    status: row.status,
    stage: row.stage,
    next: row.next ?? "",
    nextDueDate: row.next_due_date ?? null,
    nextPriority: row.next_priority ?? null,
    nextEstimatedMinutes: row.next_estimated_minutes ?? null,
    blocked: Boolean(row.blocked),
    blockerReason: row.blocker_reason ?? "",
    site: row.site ?? "",
    github: row.github ?? "",
    figma: row.figma ?? "",
    notion: row.notion ?? "",
    theme: row.theme ?? "",
    featuresDone: features.filter((f) => f.status === "fait").length,
    featuresTotal: features.length,
    tasksDone: tasks.filter((t) => t.done).length,
    tasksTotal: tasks.length,
  };
}

/** Tous les projets de l'utilisateur, avec leurs compteurs, dans l'ordre choisi. */
export async function listProjects(): Promise<ProjectSummary[]> {
  const db = await getDb();
  if (!db) return [];
  const first = await db.supabase
    .from("projects")
    .select(CARD_COLUMNS)
    .eq("user_id", db.user.id)
    .order("sort_order")
    .order("name");
  if (!first.error) {
    return ((first.data ?? []) as unknown as CardRow[]).map(toSummary);
  }
  if (!missingNextMeta(first.error.message)) {
    throw new Error(`Lecture des projets : ${first.error.message}`);
  }
  const retry = await db.supabase
    .from("projects")
    .select(CARD_COLUMNS_FALLBACK)
    .eq("user_id", db.user.id)
    .order("sort_order")
    .order("name");
  if (retry.error) throw new Error(`Lecture des projets : ${retry.error.message}`);
  return ((retry.data ?? []) as unknown as CardRow[]).map(toSummary);
}

/** Un projet complet (fiche détaillée), ou null s'il n'existe pas pour cet utilisateur. */
export async function getProject(slug: string): Promise<ProjectFull | null> {
  const db = await getDb();
  if (!db) return null;
  const first = await db.supabase
    .from("projects")
    .select(FULL_COLUMNS)
    .eq("user_id", db.user.id)
    .eq("slug", slug)
    .maybeSingle();
  if (!first.error) {
    if (!first.data) return null;
    return toFull(first.data as unknown as FullRow);
  }
  if (!missingNextMeta(first.error.message)) {
    throw new Error(`Lecture du projet : ${first.error.message}`);
  }
  const retry = await db.supabase
    .from("projects")
    .select(FULL_COLUMNS_FALLBACK)
    .eq("user_id", db.user.id)
    .eq("slug", slug)
    .maybeSingle();
  if (retry.error) throw new Error(`Lecture du projet : ${retry.error.message}`);
  if (!retry.data) return null;
  return toFull(retry.data as unknown as FullRow);
}

function toFull(row: FullRow): ProjectFull {
  const byPos = <T extends { position: number }>(a: T, b: T) => a.position - b.position;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    status: row.status,
    stage: row.stage,
    next: row.next ?? "",
    nextDueDate: row.next_due_date ?? null,
    nextPriority: row.next_priority ?? null,
    nextEstimatedMinutes: row.next_estimated_minutes ?? null,
    blocked: Boolean(row.blocked),
    blockerReason: row.blocker_reason ?? "",
    site: row.site ?? "",
    github: row.github ?? "",
    figma: row.figma ?? "",
    notion: row.notion ?? "",
    theme: row.theme ?? "",
    partner: row.partner ?? "",
    pitch: row.pitch ?? "",
    target: row.target ?? "",
    problem: row.problem ?? "",
    business: (row.business ?? {}) as Record<string, string>,
    stack: row.stack ?? [],
    team: row.team ?? [],
    risks: row.risks ?? [],
    notes: row.notes ?? "",
    updated_at: row.updated_at,
    features: [...(row.project_features ?? [])].sort(byPos),
    tasks: [...(row.project_tasks ?? [])].sort(byPos),
    log: [...(row.project_log ?? [])].sort(
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
