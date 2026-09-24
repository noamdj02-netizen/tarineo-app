import Anthropic from "@anthropic-ai/sdk";
import { limitReached } from "@/lib/billing/plan";
import { getDb } from "@/lib/db";
import { DEFAULT_MODEL, isModelId } from "@/lib/models";
import { STAGES } from "@/lib/design-data/resources";
import {
  extractMermaid,
  SCHEMA_AGENTS,
  SCHEMA_RULES,
} from "@/lib/schemas/agents";

export const runtime = "nodejs";
export const maxDuration = 90;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_EXTRA = 1000;

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status });
}

/** Refuse les appels venant d'un autre site (protège tes crédits Claude). */
function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function friendlyError(e: unknown) {
  if (e instanceof Anthropic.AuthenticationError)
    return "Clé Claude invalide. Vérifie ANTHROPIC_API_KEY.";
  if (e instanceof Anthropic.RateLimitError)
    return "Trop de demandes d’un coup. Réessaie dans un moment.";
  if (e instanceof Anthropic.APIConnectionError)
    return "Claude ne répond pas. Vérifie ta connexion.";
  return "Le schéma n’a pas pu être généré. Réessaie.";
}

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

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json(403, { error: "Origine refusée." });
  if (!process.env.ANTHROPIC_API_KEY) {
    return json(503, {
      error: "Ajoute ta clé ANTHROPIC_API_KEY pour générer des schémas.",
    });
  }
  const db = await getDb();
  if (!db) return json(401, { error: "Connecte-toi pour générer un schéma." });

  let body: {
    kind?: unknown;
    projectId?: unknown;
    extra?: unknown;
    model?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "Requête illisible." });
  }
  const agent = SCHEMA_AGENTS.find((a) => a.kind === body.kind);
  if (!agent) return json(400, { error: "Agent inconnu." });
  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  if (!UUID.test(projectId)) return json(400, { error: "Choisis un projet." });
  const extra =
    typeof body.extra === "string" ? body.extra.trim().slice(0, MAX_EXTRA) : "";
  const model = isModelId(body.model) ? body.model : DEFAULT_MODEL;
  const limit = await limitReached(db, "ai");
  if (limit) return json(402, { error: limit });

  const { data } = await db.supabase
    .from("projects")
    .select(
      "name, description, pitch, target, problem, stage, stack, business, project_features(title, status, position), project_tasks(title, done, position)",
    )
    .eq("id", projectId)
    .eq("user_id", db.user.id)
    .maybeSingle();
  if (!data) return json(404, { error: "Projet introuvable." });
  const p = data as unknown as ProjectCtx;
  const byPos = <T extends { position: number }>(a: T, b: T) =>
    a.position - b.position;
  const fiche = {
    nom: p.name,
    description: p.description,
    pitch: p.pitch,
    cible: p.target,
    probleme: p.problem,
    etape: `${p.stage}/6 ${STAGES[(p.stage || 1) - 1]}`,
    stack: p.stack,
    business: p.business,
    fonctions: [...(p.project_features ?? [])]
      .sort(byPos)
      .map((f) => `${f.title} [${f.status}]`),
    taches: [...(p.project_tasks ?? [])]
      .sort(byPos)
      .map((t) => t.title + (t.done ? " [fait]" : "")),
  };

  try {
    const res = await new Anthropic().messages.create(
      {
        model,
        max_tokens: 4000,
        system: SCHEMA_RULES,
        messages: [
          {
            role: "user",
            content: [
              agent.brief,
              `FICHE PROJET: ${JSON.stringify(fiche)}`,
              extra ? `PRÉCISION DE NOAM: ${extra}` : "",
            ]
              .filter(Boolean)
              .join("\n\n"),
          },
        ],
        ...(model === "claude-haiku-4-5"
          ? {}
          : { output_config: { effort: "medium" as const } }),
      },
      { signal: request.signal },
    );
    const text = res.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("");
    const mermaid = extractMermaid(text);
    if (!mermaid) return json(502, { error: "Réponse vide. Réessaie." });
    return json(200, { mermaid, title: `${agent.label} · ${p.name}` });
  } catch (e) {
    console.error("[schemas/generate]", e);
    return json(502, { error: friendlyError(e) });
  }
}
