import "server-only";
import type { Db } from "@/lib/db";
import { limitReached } from "@/lib/billing/plan";
import { slugify } from "@/lib/projects/types";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProjectStatus as DbProjectStatus } from "@/lib/supabase/types";
import type { ApiKeyRecord, Note, Project, Scope, Task, TaskStatus } from "./types";

function admin() {
  return createAdminClient();
}

function asUserDb(userId: string): Db {
  return {
    supabase: admin(),
    user: { id: userId, email: undefined, user_metadata: {} },
  };
}

function toMcpStatus(status: DbProjectStatus): Project["status"] {
  if (status === "focus") return "focus";
  if (status === "fini") return "done";
  return "waiting";
}

function toMcpProject(row: {
  id: string;
  name: string;
  description: string;
  status: DbProjectStatus;
  updated_at: string;
  slug?: string;
}): Project {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || null,
    status: toMcpStatus(row.status),
    createdAt: row.updated_at,
    updatedAt: row.updated_at,
  };
}

function toMcpTask(row: {
  id: string;
  project_id: string;
  title: string;
  done: boolean;
  due_date?: string | null;
  notes?: string | null;
}): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    status: row.done ? "done" : "todo",
    dueDate: row.due_date ?? null,
    notes: row.notes ?? null,
  };
}

function toMcpKey(row: {
  id: string;
  user_id: string;
  name: string;
  prefix: string;
  hash: string;
  scopes: string[];
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}): ApiKeyRecord {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    prefix: row.prefix,
    hash: row.hash,
    scopes: row.scopes.filter((s): s is Scope => s === "read" || s === "write"),
    lastUsedAt: row.last_used_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
  };
}

async function ownProject(userId: string, projectId: string) {
  const { data } = await admin()
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

function ilikeSafe(query: string) {
  return query.replace(/[%_\\]/g, "").slice(0, 200);
}

export const data = {
  async getFocusProject(userId: string): Promise<Project | null> {
    const { data: row, error } = await admin()
      .from("projects")
      .select("id, slug, name, description, status, updated_at")
      .eq("user_id", userId)
      .eq("status", "focus")
      .maybeSingle();
    if (error) throw error;
    return row ? toMcpProject(row) : null;
  },

  async listProjects(userId: string): Promise<Project[]> {
    const { data: rows, error } = await admin()
      .from("projects")
      .select("id, slug, name, description, status, updated_at")
      .eq("user_id", userId)
      .order("sort_order");
    if (error) throw error;
    return (rows ?? []).map(toMcpProject);
  },

  async getProject(userId: string, projectId: string): Promise<Project | null> {
    const { data: row, error } = await admin()
      .from("projects")
      .select("id, slug, name, description, status, updated_at")
      .eq("user_id", userId)
      .eq("id", projectId)
      .maybeSingle();
    if (error) throw error;
    return row ? toMcpProject(row) : null;
  },

  async createProject(
    userId: string,
    input: { name: string; description?: string },
  ): Promise<Project> {
    const title = input.name.trim().slice(0, 80);
    const base = slugify(title);
    if (!title || !base) throw new Error("Donne un nom au projet.");

    const limit = await limitReached(asUserDb(userId), "projects");
    if (limit) throw new Error(limit);

    const { data: taken } = await admin()
      .from("projects")
      .select("slug, sort_order")
      .eq("user_id", userId);
    const slugs = new Set((taken ?? []).map((p) => p.slug));
    let slug = base;
    for (let i = 2; slugs.has(slug); i++) slug = `${base}-${i}`;
    const sortOrder = Math.max(0, ...(taken ?? []).map((p) => p.sort_order)) + 1;

    const { data: row, error } = await admin()
      .from("projects")
      .insert({
        user_id: userId,
        slug,
        name: title,
        description: (input.description ?? "").trim().slice(0, 2000),
        status: "pause",
        stage: 1,
        sort_order: sortOrder,
      })
      .select("id, slug, name, description, status, updated_at")
      .single();
    if (error || !row) throw error ?? new Error("Création impossible.");
    return toMcpProject(row);
  },

  async listTasks(userId: string, projectId: string, status?: TaskStatus): Promise<Task[]> {
    if (!(await ownProject(userId, projectId))) return [];
    const q = admin()
      .from("project_tasks")
      .select("id, project_id, title, done, due_date, notes")
      .eq("project_id", projectId)
      .order("position");
    const { data: rows, error } = status === "done" ? await q.eq("done", true) : status === "todo" || status === "doing" ? await q.eq("done", false) : await q;
    if (error) throw error;
    return (rows ?? []).map(toMcpTask);
  },

  async createTask(
    userId: string,
    input: { projectId: string; title: string; dueDate?: string; notes?: string },
  ): Promise<Task> {
    if (!(await ownProject(userId, input.projectId))) throw new Error("Projet introuvable.");
    const { count } = await admin()
      .from("project_tasks")
      .select("id", { count: "exact", head: true })
      .eq("project_id", input.projectId);
    const { data: row, error } = await admin()
      .from("project_tasks")
      .insert({
        project_id: input.projectId,
        title: input.title.trim().slice(0, 200),
        done: false,
        position: count ?? 0,
        due_date: input.dueDate ?? null,
        notes: input.notes?.trim().slice(0, 5000) ?? "",
      })
      .select("id, project_id, title, done, due_date, notes")
      .single();
    if (error || !row) throw error ?? new Error("Création impossible.");
    return toMcpTask(row);
  },

  async updateTask(
    userId: string,
    taskId: string,
    patch: Partial<Pick<Task, "title" | "status" | "dueDate" | "notes">>,
  ): Promise<Task | null> {
    const { data: existing } = await admin()
      .from("project_tasks")
      .select("id, project_id, projects!inner(user_id)")
      .eq("id", taskId)
      .eq("projects.user_id", userId)
      .maybeSingle();
    if (!existing) return null;

    const update: {
      title?: string;
      done?: boolean;
      due_date?: string | null;
      notes?: string;
    } = {};
    if (patch.title !== undefined) update.title = patch.title.trim().slice(0, 200);
    if (patch.status !== undefined) update.done = patch.status === "done";
    if (patch.dueDate !== undefined) update.due_date = patch.dueDate;
    if (patch.notes !== undefined) update.notes = patch.notes ?? "";

    const { data: row, error } = await admin()
      .from("project_tasks")
      .update(update)
      .eq("id", taskId)
      .select("id, project_id, title, done, due_date, notes")
      .single();
    if (error || !row) throw error ?? new Error("Mise à jour impossible.");
    return toMcpTask(row);
  },

  async addNote(
    userId: string,
    input: { projectId: string; title: string; content: string; source?: string },
  ): Promise<Note> {
    if (!(await ownProject(userId, input.projectId))) throw new Error("Projet introuvable.");
    const { data: row, error } = await admin()
      .from("project_notes")
      .insert({
        user_id: userId,
        project_id: input.projectId,
        title: input.title.trim().slice(0, 200),
        content: input.content.slice(0, 50_000),
        source: input.source?.slice(0, 50) ?? null,
      })
      .select("id, project_id, title, content, source, created_at")
      .single();
    if (error || !row) throw error ?? new Error("Note impossible.");
    return {
      id: row.id,
      projectId: row.project_id,
      title: row.title,
      content: row.content,
      source: row.source,
      createdAt: row.created_at,
    };
  },

  async getProjectCard(userId: string, projectId: string) {
    const { data: row, error } = await admin()
      .from("projects")
      .select(
        "id, slug, name, description, status, stage, next, site, github, figma, notion, pitch, target, problem, business, stack, risks, theme, updated_at",
      )
      .eq("user_id", userId)
      .eq("id", projectId)
      .maybeSingle();
    if (error) throw error;
    return row;
  },

  async getFocusCard(userId: string) {
    const { data: row, error } = await admin()
      .from("projects")
      .select(
        "id, slug, name, description, status, stage, next, site, github, figma, notion, pitch, target, problem, business, stack, risks, theme, updated_at",
      )
      .eq("user_id", userId)
      .eq("status", "focus")
      .maybeSingle();
    if (error) throw error;
    return row;
  },

  async findProjectIdBySlug(userId: string, slug: string) {
    const { data: row } = await admin()
      .from("projects")
      .select("id")
      .eq("user_id", userId)
      .eq("slug", slug)
      .maybeSingle();
    return row?.id ?? null;
  },

  async listRecentNotes(userId: string, projectId: string, hours: number): Promise<Note[]> {
    if (!(await ownProject(userId, projectId))) return [];
    const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    const { data: rows, error } = await admin()
      .from("project_notes")
      .select("id, project_id, title, content, source, created_at")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return (rows ?? []).map((row) => ({
      id: row.id,
      projectId: row.project_id,
      title: row.title,
      content: row.content,
      source: row.source,
      createdAt: row.created_at,
    }));
  },

  async addLog(userId: string, projectId: string, text: string, date?: string) {
    if (!(await ownProject(userId, projectId))) throw new Error("Projet introuvable.");
    const day = date && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date
      : new Date().toISOString().slice(0, 10);
    const { data: row, error } = await admin()
      .from("project_log")
      .insert({
        project_id: projectId,
        text: text.trim().slice(0, 1000),
        date: day,
      })
      .select("id, date, text")
      .single();
    if (error || !row) throw error ?? new Error("Journal impossible.");
    return row;
  },

  async patchProject(
    userId: string,
    projectId: string,
    patch: Partial<{ next: string; site: string; github: string; figma: string; notion: string }>,
  ) {
    if (!(await ownProject(userId, projectId))) throw new Error("Projet introuvable.");
    const row = {
      next: patch.next?.trim().slice(0, 1000),
      site: patch.site?.trim().slice(0, 1000),
      github: patch.github?.trim().slice(0, 1000),
      figma: patch.figma?.trim().slice(0, 1000),
      notion: patch.notion?.trim().slice(0, 1000),
    };
    if (!Object.values(row).some(Boolean)) return;
    const { error } = await admin()
      .from("projects")
      .update({
        ...(row.next ? { next: row.next } : {}),
        ...(row.site ? { site: row.site } : {}),
        ...(row.github ? { github: row.github } : {}),
        ...(row.figma ? { figma: row.figma } : {}),
        ...(row.notion ? { notion: row.notion } : {}),
      })
      .eq("id", projectId)
      .eq("user_id", userId);
    if (error) throw error;
  },

  async listConnections(userId: string) {
    const { data: rows, error } = await admin()
      .from("tool_connections")
      .select("tool_id, connected_at, account_label")
      .eq("user_id", userId);
    if (error) {
      const fallback = await admin()
        .from("tool_connections")
        .select("tool_id, connected_at")
        .eq("user_id", userId);
      return fallback.data ?? [];
    }
    return rows ?? [];
  },

  async listWorkspace(userId: string, projectId: string) {
    if (!(await ownProject(userId, projectId))) return null;
    const [project, tasks, notes, assets, schemas, connections] = await Promise.all([
      this.getProjectCard(userId, projectId),
      this.listTasks(userId, projectId),
      this.listRecentNotes(userId, projectId, 24 * 14),
      this.listProjectAssets(userId, projectId),
      this.listProjectSchemas(userId, projectId),
      this.listConnections(userId),
    ]);
    if (!project) return null;
    return {
      project,
      tasks,
      notes: notes.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content.slice(0, 600),
        source: n.source,
      })),
      landings: assets.map((a) => ({
        id: a.id,
        title: a.title,
        kind: a.kind,
        theme_id: a.theme_id,
      })),
      schemas,
      connections,
    };
  },

  async updateBusiness(userId: string, projectId: string, business: Record<string, string>) {
    if (!(await ownProject(userId, projectId))) throw new Error("Projet introuvable.");
    const { error } = await admin()
      .from("projects")
      .update({ business })
      .eq("id", projectId)
      .eq("user_id", userId);
    if (error) throw error;
  },

  async setProjectNext(userId: string, projectId: string, next: string) {
    if (!(await ownProject(userId, projectId))) throw new Error("Projet introuvable.");
    const { error } = await admin()
      .from("projects")
      .update({ next: next.trim().slice(0, 300) })
      .eq("id", projectId)
      .eq("user_id", userId);
    if (error) throw error;
  },

  async createSchemaRow(
    userId: string,
    input: {
      projectId: string;
      title: string;
      kind: "libre" | "architecture" | "parcours" | "tunnel" | "roadmap" | "donnees" | "formation" | "offre";
      mermaid?: string;
    },
  ) {
    if (!(await ownProject(userId, input.projectId))) throw new Error("Projet introuvable.");
    const limit = await limitReached(asUserDb(userId), "schemas");
    if (limit) throw new Error(limit);
    const { data: row, error } = await admin()
      .from("project_schemas")
      .insert({
        user_id: userId,
        project_id: input.projectId,
        title: input.title.trim().slice(0, 120) || "Sans titre",
        kind: input.kind,
        scene: {
          elements: [],
          appState: input.mermaid ? { navpitMermaid: input.mermaid } : {},
        },
      })
      .select("id, title, kind, project_id")
      .single();
    if (error || !row) throw error ?? new Error("Création du schéma impossible.");
    return row;
  },

  async attachComponent(
    userId: string,
    input: {
      projectId: string;
      title: string;
      html: string;
      themeId?: string;
      kind?: "component" | "landing";
    },
  ) {
    if (!(await ownProject(userId, input.projectId))) throw new Error("Projet introuvable.");
    const kind = input.kind ?? "component";
    const payload = {
      user_id: userId,
      project_id: input.projectId,
      kind,
      title: input.title.trim().slice(0, 120),
      html: input.html.slice(0, 80_000),
      theme_id: input.themeId?.slice(0, 60) ?? null,
    };
    let { data: row, error } = await admin()
      .from("project_assets")
      .insert(payload)
      .select("id, project_id, title, theme_id")
      .single();
    if (error && kind === "landing") {
      const fallback = await admin()
        .from("project_assets")
        .insert({ ...payload, kind: "component" })
        .select("id, project_id, title, theme_id")
        .single();
      row = fallback.data;
      error = fallback.error;
    }
    if (error || !row) throw error ?? new Error("Composant non collé.");
    return row;
  },

  async listProjectSchemas(userId: string, projectId: string) {
    if (!(await ownProject(userId, projectId))) return [];
    const { data: rows, error } = await admin()
      .from("project_schemas")
      .select("id, title, kind, updated_at")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return rows ?? [];
  },

  async listProjectAssets(userId: string, projectId: string) {
    if (!(await ownProject(userId, projectId))) return [];
    const { data: rows, error } = await admin()
      .from("project_assets")
      .select("id, title, html, theme_id, kind, created_at")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return rows ?? [];
  },

  async searchNotes(userId: string, query: string, limit: number): Promise<Note[]> {
    const q = ilikeSafe(query);
    if (q.length < 2) return [];
    const { data: rows, error } = await admin()
      .from("project_notes")
      .select("id, project_id, title, content, source, created_at")
      .eq("user_id", userId)
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (rows ?? []).map((row) => ({
      id: row.id,
      projectId: row.project_id,
      title: row.title,
      content: row.content,
      source: row.source,
      createdAt: row.created_at,
    }));
  },

  async findApiKeyByHash(hash: string): Promise<ApiKeyRecord | null> {
    const { data: row, error } = await admin()
      .from("api_keys")
      .select("id, user_id, name, prefix, hash, scopes, last_used_at, revoked_at, created_at")
      .eq("hash", hash)
      .maybeSingle();
    if (error) throw error;
    return row ? toMcpKey(row) : null;
  },

  async touchApiKey(id: string): Promise<void> {
    await admin().from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", id);
  },

  async listApiKeys(userId: string): Promise<ApiKeyRecord[]> {
    const { data: rows, error } = await admin()
      .from("api_keys")
      .select("id, user_id, name, prefix, hash, scopes, last_used_at, revoked_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (rows ?? []).map(toMcpKey);
  },

  async insertApiKey(record: Omit<ApiKeyRecord, "id" | "createdAt">): Promise<ApiKeyRecord> {
    const { data: row, error } = await admin()
      .from("api_keys")
      .insert({
        user_id: record.userId,
        name: record.name,
        prefix: record.prefix,
        hash: record.hash,
        scopes: record.scopes,
        last_used_at: record.lastUsedAt ?? null,
        revoked_at: record.revokedAt ?? null,
      })
      .select("id, user_id, name, prefix, hash, scopes, last_used_at, revoked_at, created_at")
      .single();
    if (error || !row) throw error ?? new Error("Clé impossible.");
    return toMcpKey(row);
  },

  async revokeApiKey(userId: string, id: string): Promise<boolean> {
    const { data, error } = await admin()
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId)
      .is("revoked_at", null)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  },
};
