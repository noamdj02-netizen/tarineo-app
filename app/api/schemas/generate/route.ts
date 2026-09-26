import Anthropic from "@anthropic-ai/sdk";
import { limitReached } from "@/lib/billing/plan";
import { getDb } from "@/lib/db";
import { DEFAULT_MODEL, isModelId } from "@/lib/models";
import { SCHEMA_AGENTS } from "@/lib/schemas/agents";
import { generateMermaidForProject } from "@/lib/schemas/generate";

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
    icons?: unknown;
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

  try {
    const generated = await generateMermaidForProject({
      userId: db.user.id,
      projectId,
      kind: agent.kind,
      extra,
      model,
      icons: body.icons === true,
      signal: request.signal,
    });
    return json(200, {
      mermaid: generated.mermaid,
      title: generated.title,
      projectName: generated.projectName,
      stickies: generated.stickies,
      icons: generated.icons ?? {},
    });
  } catch (e) {
    console.error("[schemas/generate]", e);
    return json(502, { error: friendlyError(e) });
  }
}
