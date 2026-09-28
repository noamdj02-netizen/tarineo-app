import "server-only";
import type { Db } from "@/lib/db";
import { listChantiers } from "@/lib/metier/queries";
import { TARINEO_AGENT_PROMPT } from "./prompt";
import { ROLE_PROMPTS, type AgentRole } from "./roles";
import { inferEntityType, type PageContext } from "./page-context";

export const SHORT_RULES = TARINEO_AGENT_PROMPT;

export const STATIC_KNOWLEDGE = SHORT_RULES;

export function wantsDesignKnowledge() {
  return false;
}

export async function slimContext(
  _db: Db,
  firstName: string,
  opts: {
    projectId?: string | null;
    role: AgentRole;
    includeDesign: boolean;
    question?: string;
    page?: PageContext | null;
  },
) {
  const who = firstName || "l’artisan";
  const chantiers = await listChantiers();
  const focus = chantiers.find((c) => c.status === "focus");
  const page = opts.page;
  const type = page?.entityType ?? (page?.route ? inferEntityType(page.route) : undefined);
  const parts = [
    TARINEO_AGENT_PROMPT,
    `Tu es le copilote TARINEO de ${who}.`,
    ROLE_PROMPTS[opts.role],
    chantiers.length
      ? `Chantiers (max 20) : ${chantiers
          .slice(0, 20)
          .map((c) => `${c.name} [${c.id.slice(0, 8)} /${c.slug} · ${c.status}]`)
          .join(" · ")}`
      : "Aucun chantier.",
    focus ? `Chantier focus : ${focus.name}.` : "",
    page?.route ? `Page : ${page.route}${type ? ` (${type})` : ""}${page.entityId ? ` id=${page.entityId}` : ""}.` : "",
    opts.projectId ? `Chantier de fil : ${opts.projectId}.` : "",
    "Pour le détail d’un chantier ou d’une pièce, appelle get_chantier / get_document. Ne charge pas toute la base.",
  ];
  return parts.filter(Boolean).join("\n\n");
}
