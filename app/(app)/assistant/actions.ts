"use server";

import { isAgentRole, projectSlugFromPath, type AgentRole } from "@/lib/assistant/roles";
import { getDb } from "@/lib/db";
import { listChantiers } from "@/lib/metier/queries";

export type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

const GENERIC_PRESETS = [
  "Faire le point sur mes chantiers",
  "Voir mes devis à relancer",
  "Analyser mes achats",
  "Voir les hausses fournisseurs",
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
    if (slug) {
      const chantiers = await listChantiers();
      projectId = chantiers.find((c) => c.slug === slug)?.id ?? null;
    }
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
    presets: GENERIC_PRESETS,
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
