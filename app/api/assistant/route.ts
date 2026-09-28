import Anthropic from "@anthropic-ai/sdk";
import { encodeActions } from "@/lib/assistant/actions-markup";
import { slimContext } from "@/lib/assistant/context";
import { fileKind, MAX_FILE_BYTES, MAX_FILES } from "@/lib/assistant/files";
import { isAllowedOrigin } from "@/lib/assistant/origin";
import { inferEntityType, parsePageContext } from "@/lib/assistant/page-context";
import { isAgentRole, projectSlugFromPath, type AgentRole } from "@/lib/assistant/roles";
import { COPILOT_TOOLS, runCopilotTool } from "@/lib/assistant/tools";
import { limitReached } from "@/lib/billing/plan";
import { getDb } from "@/lib/db";
import { listChantiers, getDocument } from "@/lib/metier/queries";
import { DEFAULT_MODEL, isModelId, type ModelId } from "@/lib/models";
import { classifyAgent } from "@/lib/analytics/catalog";
import { track } from "@/lib/analytics/track";
import { getViewer } from "@/lib/session";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_QUESTION = 4000;
const HISTORY = 12;
const MAX_TOKENS = 1500;
const TOOL_ROUNDS = 6;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(status: number, error: string, code?: string) {
  return Response.json({ success: false, error, code: code ?? "error" }, { status });
}

function pickModel(requested: unknown): ModelId {
  if (isModelId(requested)) return requested;
  const env = process.env.ANTHROPIC_MODEL;
  return isModelId(env) ? env : DEFAULT_MODEL;
}

function modelOptions(model: ModelId): Pick<Anthropic.MessageCreateParams, "output_config"> {
  if (model === "claude-haiku-4-5") return {};
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

function textFrom(content: Anthropic.ContentBlock[]): string {
  return content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request).ok) return json(403, "Origine refusée.", "origin_denied");
  if (!process.env.ANTHROPIC_API_KEY) {
    return json(503, "Ajoute ta clé ANTHROPIC_API_KEY dans .env.local, puis relance le serveur.", "config");
  }

  const db = await getDb();
  if (!db) return json(401, "Connecte-toi pour utiliser l’assistant.", "unauthorized");

  let body: {
    question?: unknown;
    model?: unknown;
    page?: unknown;
    context?: unknown;
    files?: unknown;
    projectId?: unknown;
    role?: unknown;
    user_id?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return json(400, "Requête illisible.");
  }
  const files = parseFiles(body.files);
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question && !files.length) return json(400, "Question vide.");
  if (question.length > MAX_QUESTION) return json(400, "Question trop longue.");
  const model = pickModel(body.model);
  const role: AgentRole = isAgentRole(body.role) ? body.role : "general";
  const pageRaw = typeof body.page === "string" ? body.page.slice(0, 160) : "";
  const pageCtx = parsePageContext(body.context, pageRaw);
  if (pageCtx && !pageCtx.entityType) pageCtx.entityType = inferEntityType(pageCtx.route);
  if (pageCtx && !pageCtx.entityId) {
    const piece = /^\/pieces\/([0-9a-f-]{36})/i.exec(pageCtx.route);
    if (piece?.[1]) pageCtx.entityId = piece[1];
  }
  const page = pageCtx?.route ?? pageRaw;
  void body.user_id;

  const chantiers = await listChantiers();
  let projectId = typeof body.projectId === "string" && UUID.test(body.projectId) ? body.projectId : null;
  let chantierId: string | null = null;
  if (projectId && chantiers.some((c) => c.id === projectId)) {
    chantierId = projectId;
    projectId = null;
  }
  if (!chantierId) {
    const slug = projectSlugFromPath(page);
    if (slug) chantierId = chantiers.find((c) => c.slug === slug)?.id ?? null;
  }
  if (pageCtx && chantierId) {
    if (!pageCtx.entityType) pageCtx.entityType = "chantier";
    if (!pageCtx.entityId) pageCtx.entityId = chantierId;
  }
  if (pageCtx?.entityId) {
    if (pageCtx.entityType === "chantier" || pageCtx.entityType === "dashboard") {
      if (!chantiers.some((c) => c.id === pageCtx.entityId)) pageCtx.entityId = undefined;
    } else {
      const owned = await getDocument(pageCtx.entityId);
      if (!owned) pageCtx.entityId = undefined;
    }
  }

  const stored = [
    question || "Lis ce fichier et dis-moi quoi en faire.",
    ...files.map((f) => `📎 ${f.name}`),
  ].join("\n");
  const limit = await limitReached(db, "ai");
  if (limit) return json(402, limit);

  let historyQuery = db.supabase
    .from("chat_messages")
    .select("role, content")
    .eq("user_id", db.user.id)
    .eq("agent_role", role)
    .order("created_at", { ascending: false })
    .limit(HISTORY);
  historyQuery = projectId ? historyQuery.eq("project_id", projectId) : historyQuery.is("project_id", null);

  const { data: past } = await historyQuery;
  const history: Anthropic.MessageParam[] = (past ?? [])
    .reverse()
    .map((m) => ({ role: m.role, content: m.content }));
  while (history[0]?.role === "assistant") history.shift();

  const { data: saved, error: saveError } = await db.supabase
    .from("chat_messages")
    .insert({
      user_id: db.user.id,
      role: "user",
      content: stored,
      project_id: projectId,
      agent_role: role,
    })
    .select("id")
    .single();
  if (saveError || !saved) return json(500, "Impossible d’enregistrer ta question.");

  const viewer = await getViewer();
  const system: Anthropic.TextBlockParam[] = [
    {
      type: "text",
      text: await slimContext(db, viewer?.firstName ?? "", {
        projectId: chantierId,
        role,
        includeDesign: false,
        question,
        page: pageCtx,
      }),
    },
  ];
  if (/^\/[\w\-/]*$/.test(page)) {
    system.push({
      type: "text",
      text: `Page TARINEO : ${page}.${chantierId ? ` Chantier ouvert : ${chantierId}. Appelle get_chantier sans redemander lequel.` : ""} Rôle : ${role}.`,
    });
  }

  const client = new Anthropic();
  const encoder = new TextEncoder();
  const startedAt = Date.now();
  const agent = classifyAgent(question);
  await track({
    name: "copilot_prompt_sent",
    userId: db.user.id,
    feature: "copilote",
    path: page || "/copilote",
    properties: { agent, model, role },
  });

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
        const messages: Anthropic.MessageParam[] = [
          ...history,
          { role: "user", content: toContent(question, files) },
        ];
        const actions = [];
        const reveals: string[] = [];

        let finalText = "";
        for (let round = 0; round < TOOL_ROUNDS; round++) {
          const res = await client.messages.create(
            {
              model,
              max_tokens: MAX_TOKENS,
              system,
              messages,
              tools: COPILOT_TOOLS,
              cache_control: { type: "ephemeral" },
              ...modelOptions(model),
            },
            { signal: request.signal },
          );

          if (res.stop_reason === "tool_use") {
            const uses = res.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
            messages.push({ role: "assistant", content: res.content });
            const results: Anthropic.ToolResultBlockParam[] = [];
            for (const use of uses) {
              await track({
                name: "copilot_tool_started",
                userId: db.user.id,
                feature: "copilote",
                path: page || "/copilote",
                properties: { tool: use.name },
              });
              const out = await runCopilotTool({ userId: db.user.id, page: pageCtx ?? undefined }, use.name, use.input);
              if (!out.awaiting) {
                await track({
                  name: out.success ? "copilot_tool_success" : "copilot_tool_failed",
                  userId: db.user.id,
                  feature: "copilote",
                  path: page || "/copilote",
                  properties: { tool: use.name, status: out.success ? "success" : "failed" },
                });
              }
              if (out.action) actions.push(out.action);
              if (out.reveal) reveals.push(out.reveal);
              results.push({
                type: "tool_result",
                tool_use_id: use.id,
                content: out.text,
              });
            }
            messages.push({ role: "user", content: results });
            continue;
          }

          finalText = textFrom(res.content);
          if (res.stop_reason === "max_tokens") {
            finalText += "\n\n(Réponse coupée : demande-moi le détail.)";
          } else if (res.stop_reason === "refusal") {
            finalText = finalText || "Je ne peux pas répondre à cette demande.";
          }
          break;
        }

        if (!finalText) {
          const claude = client.messages.stream(
            {
              model,
              max_tokens: MAX_TOKENS,
              system,
              messages,
              cache_control: { type: "ephemeral" },
              ...modelOptions(model),
            },
            { signal: request.signal },
          );
          claude.on("text", (delta) => {
            finalText += delta;
            text = finalText;
            push(delta);
          });
          await claude.finalMessage();
        } else {
          text = finalText;
          push(finalText);
        }

        if (reveals.length) {
          const shown = `\n\n${reveals.join("\n\n")}`;
          finalText += shown;
          push(shown);
        }
        const suffix = encodeActions(actions);
        if (suffix) {
          finalText += suffix;
          push(suffix);
        }
        text = finalText;
      } catch (e) {
        if (request.signal.aborted) {
          // arrêt demandé : on garde ce qui a déjà été écrit
        } else {
          failed = true;
          console.error("[assistant]", e);
          const msg = friendlyError(e);
          push(`${text ? "\n\n" : ""}⚠️ ${msg}`);
          await track({
            name: "copilot_error",
            userId: db.user.id,
            feature: "copilote",
            path: page || "/copilote",
            durationMs: Date.now() - startedAt,
            properties: { agent, model },
          });
        }
      } finally {
        if (text && !failed) {
          await db.supabase.from("chat_messages").insert({
            user_id: db.user.id,
            role: "assistant",
            content: text,
            project_id: projectId,
            agent_role: role,
          });
          await track({
            name: "copilot_response_received",
            userId: db.user.id,
            feature: "copilote",
            path: page || "/copilote",
            durationMs: Date.now() - startedAt,
            properties: { agent, model },
          });
        } else {
          await db.supabase
            .from("chat_messages")
            .delete()
            .eq("id", saved.id)
            .eq("user_id", db.user.id);
        }
        try {
          controller.close();
        } catch {
          // flux déjà fermé
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

type InFile = { name: string; mime: string; data: string };

function parseFiles(raw: unknown): InFile[] {
  if (!Array.isArray(raw)) return [];
  const out: InFile[] = [];
  for (const x of raw.slice(0, MAX_FILES)) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.slice(0, 120) : "";
    const mime = typeof o.mime === "string" ? o.mime : "";
    const data = typeof o.data === "string" ? o.data.replace(/\s/g, "") : "";
    if (!name || !data || !fileKind(mime)) continue;
    if (data.length > Math.ceil((MAX_FILE_BYTES * 4) / 3) + 64) continue;
    out.push({ name, mime, data });
  }
  return out;
}

function toContent(question: string, files: InFile[]): Anthropic.MessageParam["content"] {
  const blocks: Anthropic.ContentBlockParam[] = [];
  const text = question || "Lis ce fichier et dis-moi quoi en faire.";
  blocks.push({ type: "text", text });
  for (const f of files) {
    const kind = fileKind(f.mime);
    if (kind === "image") {
      blocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: f.mime as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: f.data,
        },
      });
    } else if (kind === "pdf") {
      blocks.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: f.data },
      });
    } else if (kind === "text") {
      try {
        const decoded = Buffer.from(f.data, "base64").toString("utf8").slice(0, 40_000);
        blocks.push({ type: "text", text: `\n--- ${f.name} ---\n${decoded}` });
      } catch {
        blocks.push({ type: "text", text: `(Impossible de lire ${f.name})` });
      }
    }
  }
  return blocks;
}
