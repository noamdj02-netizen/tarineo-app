import type { AgentRole } from "@/lib/supabase/types";

export type { AgentRole };

export const AGENT_ROLES: AgentRole[] = ["general", "tech", "produit", "design", "launch"];

export const AGENT_ROLE_LABELS: Record<AgentRole, string> = {
  general: "Général",
  tech: "Tech",
  produit: "Produit",
  design: "Design",
  launch: "Launch",
};

export function isAgentRole(v: unknown): v is AgentRole {
  return typeof v === "string" && AGENT_ROLES.includes(v as AgentRole);
}

export const ROLE_PROMPTS: Record<AgentRole, string> = {
  general:
    "Rôle Général : lis list_workspace, puis agis (tâche, note, next, mail). Pas de roman.",
  tech: "Rôle Tech : stack, GitHub, schéma. Crée la tâche ou le schéma, n’invente pas un service hors stack.",
  produit:
    "Rôle Produit : cible, pitch, parcours. Génère le schéma ou la user story dans Navpit.",
  design:
    "Rôle Design : DESIGN.md + skill landing. attach_landing / attach_component, pas un descriptif.",
  launch:
    "Rôle Launch : get_launch_checks d’abord (checks + Stripe/GA/Vercel). Envoie le mail (send_mail), enregistre le post (save_marketing), log le geste. Gmail connecté = reply-to. Resend envoie.",
};

export function projectSlugFromPath(path: string) {
  const m = /^\/projets\/([a-z0-9-]+)/.exec(path);
  return m?.[1] ?? null;
}
