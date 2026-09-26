"use server";

import { isAgentRole, projectSlugFromPath, type AgentRole } from "@/lib/assistant/roles";
import { isOwner } from "@/lib/billing/plan";
import { getDb } from "@/lib/db";
import { PRESETS } from "@/lib/design-data/assistant";
import { data } from "@/lib/mcp/data";

export type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

const GENERIC_PRESETS = [
  "Quelle est ma priorité cette semaine ?",
  "Fais le débrief du Focus : note + 3 actions",
  "Crée un projet en pause nommé Relais",
  "Dessine le schéma « comment ça marche » du Focus",
];

export async function loadAssistant(opts?: {
  projectId?: string | null;
  role?: AgentRole;
  page?: string;
}): Promise<{ history: ChatMessage[]; presets: string[]; projectId: string | null; role: AgentRole }> {
  const role: AgentRole = isAgentRole(opts?.role) ? opts.role : "general";
  const db = await getDb();
  if (!db) return { history: [], presets: GENERIC_PRESETS, projectId: null, role };

  let projectId = opts?.projectId ?? null;
  if (!projectId && opts?.page) {
    const slug = projectSlugFromPath(opts.page);
    if (slug) projectId = await data.findProjectIdBySlug(db.user.id, slug);
  }

  let q = db.supabase
    .from("chat_messages")
    .select("id, role, content")
    .eq("user_id", db.user.id)
    .eq("agent_role", role)
    .order("created_at", { ascending: false })
    .limit(50);
  q = projectId ? q.eq("project_id", projectId) : q.is("project_id", null);

  const { data: rows } = await q;
  return {
    history: (rows ?? []).reverse(),
    presets: isOwner(db.user.email) ? PRESETS : GENERIC_PRESETS,
    projectId,
    role,
  };
}

export async function clearChat(opts?: { projectId?: string | null; role?: AgentRole }) {
  const db = await getDb();
  if (!db) return { ok: false };
  const role: AgentRole = isAgentRole(opts?.role) ? opts.role : "general";
  let q = db.supabase.from("chat_messages").delete().eq("user_id", db.user.id).eq("agent_role", role);
  q = opts?.projectId ? q.eq("project_id", opts.projectId) : q.is("project_id", null);
  const { error } = await q;
  return { ok: !error };
}
