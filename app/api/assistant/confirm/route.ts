import { getDb } from "@/lib/db";
import { isAllowedOrigin } from "@/lib/assistant/origin";
import { humanPendingError, verifyPendingAction } from "@/lib/assistant/pending-action";
import { runCopilotTool } from "@/lib/assistant/tools";
import { track } from "@/lib/analytics/track";
import { encodeActions } from "@/lib/assistant/actions-markup";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAllowedOrigin(request).ok) {
    return Response.json({ success: false, error: "Origine refusée." }, { status: 403 });
  }
  const db = await getDb();
  if (!db) return Response.json({ success: false, error: "Connecte-toi pour confirmer." }, { status: 401 });

  let body: { actionId?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Requête illisible." }, { status: 400 });
  }
  const token = typeof body.actionId === "string" ? body.actionId : "";
  const verified = verifyPendingAction(token, db.user.id);
  if (!verified.ok) {
    await track({
      name: "copilot_action_rejected",
      userId: db.user.id,
      feature: "copilote",
      properties: { code: verified.code },
    });
    return Response.json(
      { success: false, error: humanPendingError(verified.code) },
      { status: verified.code === "forbidden" ? 403 : 400 },
    );
  }

  await track({
    name: "copilot_action_confirmed",
    userId: db.user.id,
    feature: "copilote",
    properties: { tool: verified.pending.tool },
  });
  await track({
    name: "copilot_tool_started",
    userId: db.user.id,
    feature: "copilote",
    properties: { tool: verified.pending.tool, confirmed: true },
  });

  const out = await runCopilotTool({ userId: db.user.id }, verified.pending.tool, verified.pending.args, {
    serverConfirmed: true,
  });
  await track({
    name: out.success ? "copilot_tool_success" : "copilot_tool_failed",
    userId: db.user.id,
    feature: "copilote",
    properties: { tool: verified.pending.tool },
  });

  const suffix = out.action ? encodeActions([out.action]) : "";
  return Response.json({
    success: out.success,
    message: out.text + suffix,
    tool: verified.pending.tool,
    toolCalls: [{ name: verified.pending.tool, success: out.success }],
  });
}
