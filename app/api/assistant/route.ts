import Anthropic from "@anthropic-ai/sdk";
import { STATIC_KNOWLEDGE, userContext } from "@/lib/assistant/context";
import { limitReached } from "@/lib/billing/plan";
import { getDb } from "@/lib/db";
import { DEFAULT_MODEL, isModelId, type ModelId } from "@/lib/models";
import { getViewer } from "@/lib/session";

export const runtime = "nodejs";
// une réponse longue peut prendre du temps
export const maxDuration = 120;

const MAX_QUESTION = 4000;
/** Nombre de messages d'historique renvoyés à Claude (comme l'original : 12). */
const HISTORY = 12;

function json(status: number, error: string) {
  return Response.json({ error }, { status });
}

/** Le modèle demandé s'il est autorisé, sinon ANTHROPIC_MODEL, sinon le défaut. */
function pickModel(requested: unknown): ModelId {
  if (isModelId(requested)) return requested;
  const env = process.env.ANTHROPIC_MODEL;
  return isModelId(env) ? env : DEFAULT_MODEL;
}

/** Réglages par modèle : Haiku 4.5 n'accepte pas `effort`, les autres oui. */
function modelOptions(model: ModelId): Pick<Anthropic.MessageCreateParams, "output_config"> {
  if (model === "claude-haiku-4-5") return {};
  // réponses courtes pour un chat : effort moyen suffit et coûte moins
  return { output_config: { effort: "medium" } };
}

function friendlyError(e: unknown) {
  if (e instanceof Anthropic.AuthenticationError)
    return "Clé Claude invalide. Vérifie ANTHROPIC_API_KEY.";
  if (e instanceof Anthropic.RateLimitError)
    return "Trop de questions d’un coup. Réessaie dans un moment.";
  if (e instanceof Anthropic.APIConnectionError)
    return "Claude ne répond pas. Vérifie ta connexion.";
  if (e instanceof Anthropic.APIError && (e.status ?? 0) >= 500)
    return "Claude est surchargé. Réessaie dans un moment.";
  return "Réponse interrompue. Tu peux renvoyer ta question.";
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

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json(403, "Origine refusée.");
  if (!process.env.ANTHROPIC_API_KEY) {
    return json(503, "Ajoute ta clé ANTHROPIC_API_KEY dans .env.local, puis relance le serveur.");
  }

  const db = await getDb();
  if (!db) return json(401, "Connecte-toi pour utiliser l’assistant.");

  let body: { question?: unknown; model?: unknown };
  try {
    body = await request.json();
  } catch {
    return json(400, "Requête illisible.");
  }
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) return json(400, "Question vide.");
  if (question.length > MAX_QUESTION) return json(400, "Question trop longue.");
  const model = pickModel(body.model);
  const limit = await limitReached(db, "ai");
  if (limit) return json(402, limit);

  // Historique lu côté serveur (le navigateur n'envoie que la nouvelle question)
  const { data: past } = await db.supabase
    .from("chat_messages")
    .select("role, content")
    .eq("user_id", db.user.id)
    .order("created_at", { ascending: false })
    .limit(HISTORY);
  const history: Anthropic.MessageParam[] = (past ?? [])
    .reverse()
    .map((m) => ({ role: m.role, content: m.content }));
  // L'API veut un premier message « user »
  while (history[0]?.role === "assistant") history.shift();

  const { data: saved, error: saveError } = await db.supabase
    .from("chat_messages")
    .insert({ user_id: db.user.id, role: "user", content: question })
    .select("id")
    .single();
  if (saveError || !saved) return json(500, "Impossible d’enregistrer ta question.");

  const viewer = await getViewer();
  // Le fixe d'abord, puis ce qui change : le début reste identique d'une question à l'autre.
  const system: Anthropic.TextBlockParam[] = [
    { type: "text", text: STATIC_KNOWLEDGE },
    { type: "text", text: await userContext(db, viewer?.firstName ?? "") },
  ];

  const client = new Anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let text = "";
      let failed = false;
      const push = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // le navigateur a fermé la connexion
        }
      };
      try {
        const claude = client.messages.stream(
          {
            model,
            max_tokens: 16000,
            system,
            messages: [...history, { role: "user", content: question }],
            // cache automatique : consignes + historique relus à ~10 % du prix au message suivant
            cache_control: { type: "ephemeral" },
            ...modelOptions(model),
          },
          { signal: request.signal },
        );
        claude.on("text", (delta) => {
          text += delta;
          push(delta);
        });
        const final = await claude.finalMessage();

        let suffix = "";
        if (final.stop_reason === "max_tokens") {
          suffix = "\n\n(Réponse coupée : demande moins à la fois.)";
        } else if (final.stop_reason === "refusal") {
          suffix = text ? "\n\n(Réponse arrêtée.)" : "Je ne peux pas répondre à cette demande.";
        }
        if (suffix) {
          text += suffix;
          push(suffix);
        }
      } catch (e) {
        if (request.signal.aborted) {
          // arrêt demandé : on garde ce qui a déjà été écrit
        } else {
          failed = true;
          console.error("[assistant]", e);
          const msg = friendlyError(e);
          push(`${text ? "\n\n" : ""}⚠️ ${msg}`);
        }
      } finally {
        if (text && !failed) {
          await db.supabase
            .from("chat_messages")
            .insert({ user_id: db.user.id, role: "assistant", content: text });
        } else {
          // pas de réponse utilisable : on retire la question pour garder un historique propre
          await db.supabase
            .from("chat_messages")
            .delete()
            .eq("id", saved.id)
            .eq("user_id", db.user.id);
        }
        try {
          controller.close();
        } catch {
          // flux déjà fermé (le navigateur est parti)
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Model": model,
    },
  });
}
