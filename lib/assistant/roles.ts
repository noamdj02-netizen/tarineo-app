import type { AgentRole } from "@/lib/supabase/types";

export type { AgentRole };

export const AGENT_ROLES: AgentRole[] = ["general", "tech", "produit", "design", "launch"];

export const AGENT_ROLE_LABELS: Record<AgentRole, string> = {
  general: "Lecture",
  tech: "Achats",
  produit: "Devis",
  design: "Chantier",
  launch: "Client",
};

export function isAgentRole(v: unknown): v is AgentRole {
  return typeof v === "string" && AGENT_ROLES.includes(v as AgentRole);
}

export const ROLE_PROMPTS: Record<AgentRole, string> = {
  general: "Tu lis les devis et factures déposés. Réponds court, en français, sans inventer de prix.",
  tech: "Tu parles achats : distributeurs, prix d’achat, bons de commande.",
  produit: "Tu prépares des devis client à partir des lignes d’achat. Distingue prix d’achat et prix de vente.",
  design: "Tu restes sur le chantier ouvert : lieu, client, marchandises liées aux documents.",
  launch: "Tu parles au client de l’artisan. Pas de jargon fournisseur.",
};

export function projectSlugFromPath(path: string) {
  const m = /^\/projets\/([a-z0-9-]+)/.exec(path);
  return m?.[1] ?? null;
}
