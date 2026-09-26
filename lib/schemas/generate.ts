import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { STAGES } from "@/lib/design-data/resources";
import { DEFAULT_MODEL, isModelId, type ModelId } from "@/lib/models";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SchemaKind } from "@/lib/supabase/types";
import { extractMermaid, looksLikeMermaid, SCHEMA_AGENTS, SCHEMA_RULES } from "./agents";

type ProjectCtx = {
  name: string;
  description: string;
  pitch: string;
  target: string;
  problem: string;
  stage: number;
  stack: string[];
  business: Record<string, string>;
  project_features: { title: string; status: string; position: number }[];
  project_tasks: { title: string; done: boolean; position: number }[];
};

export async function generateMermaidForProject(input: {
  userId: string;
  projectId: string;
  kind: Exclude<SchemaKind, "libre">;
  extra?: string;
  model?: string;
  signal?: AbortSignal;
}): Promise<{ mermaid: string; title: string; projectName: string }> {
  const agent = SCHEMA_AGENTS.find((a) => a.kind === input.kind);
  if (!agent) throw new Error("Agent schéma inconnu.");

  const { data: row } = await createAdminClient()
    .from("projects")
    .select(
      "name, description, pitch, target, problem, stage, stack, business, project_features(title, status, position), project_tasks(title, done, position)",
    )
    .eq("id", input.projectId)
    .eq("user_id", input.userId)
    .maybeSingle();
  if (!row) throw new Error("Projet introuvable.");

  const p = row as unknown as ProjectCtx;
  const byPos = <T extends { position: number }>(a: T, b: T) => a.position - b.position;
  const fiche = {
    nom: p.name,
    description: p.description,
    pitch: p.pitch,
    cible: p.target,
    probleme: p.problem,
    etape: `${p.stage}/6 ${STAGES[(p.stage || 1) - 1]}`,
    stack: p.stack,
    business: p.business,
    fonctions: [...(p.project_features ?? [])].sort(byPos).map((f) => `${f.title} [${f.status}]`),
    taches: [...(p.project_tasks ?? [])]
      .sort(byPos)
      .map((t) => t.title + (t.done ? " [fait]" : "")),
  };

  const model: ModelId = isModelId(input.model) ? input.model : DEFAULT_MODEL;
  const client = new Anthropic();
  const userMsg = [agent.brief, `FICHE PROJET: ${JSON.stringify(fiche)}`, input.extra ? `VARIABLES: ${input.extra}` : ""]
    .filter(Boolean)
    .join("\n\n");

  async function ask(extraNote?: string) {
    const res = await client.messages.create(
      {
        model,
        max_tokens: 4000,
        system: SCHEMA_RULES,
        messages: [
          {
            role: "user",
            content: extraNote ? `${userMsg}\n\nCORRECTION: ${extraNote}` : userMsg,
          },
        ],
        ...(model === "claude-haiku-4-5" ? {} : { output_config: { effort: "medium" as const } }),
      },
      { signal: input.signal },
    );
    return extractMermaid(res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join(""));
  }

  let mermaid = await ask();
  if (!mermaid || !looksLikeMermaid(mermaid)) {
    mermaid = await ask(
      "Le rendu precedent etait invalide. Recommence. Un seul bloc mermaid. flowchart ou classDiagram. Libelles entre guillemets. Pas de caracteres speciaux.",
    );
  }
  if (!mermaid || !looksLikeMermaid(mermaid)) throw new Error("Réponse schéma vide.");
  return { mermaid, title: `${agent.label} · ${p.name}`, projectName: p.name };
}
