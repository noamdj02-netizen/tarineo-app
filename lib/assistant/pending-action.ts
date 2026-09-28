import { createHmac, timingSafeEqual } from "node:crypto";

const TTL_MS = 15 * 60 * 1000;

export type PendingAction = {
  actionId: string;
  userId: string;
  tool: string;
  args: Record<string, unknown>;
  exp: number;
};

function secret(env: NodeJS.Dict<string> = process.env) {
  return (
    env.ASSISTANT_ACTION_SECRET?.trim() ||
    env.CRON_SECRET?.trim() ||
    env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    ""
  );
}

function b64url(buf: Buffer | string) {
  const b = typeof buf === "string" ? Buffer.from(buf) : buf;
  return b.toString("base64url");
}

function sign(payload: string, env: NodeJS.Dict<string> = process.env) {
  const key = secret(env);
  if (!key) throw new Error("Secret de confirmation assistant manquant.");
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function issuePendingAction(
  input: { userId: string; tool: string; args: Record<string, unknown> },
  env: NodeJS.Dict<string> = process.env,
  now = Date.now(),
): { actionId: string; token: string; exp: number } {
  const actionId = crypto.randomUUID();
  const pending: PendingAction = {
    actionId,
    userId: input.userId,
    tool: input.tool,
    args: input.args,
    exp: now + TTL_MS,
  };
  const payload = b64url(JSON.stringify(pending));
  const token = `${payload}.${sign(payload, env)}`;
  return { actionId, token, exp: pending.exp };
}

export type PendingVerify =
  | { ok: true; pending: PendingAction }
  | { ok: false; code: "invalid" | "expired" | "forbidden" };

export function verifyPendingAction(
  token: string,
  userId: string,
  env: NodeJS.Dict<string> = process.env,
  now = Date.now(),
): PendingVerify {
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return { ok: false, code: "invalid" };
  let expected: string;
  try {
    expected = sign(payload, env);
  } catch {
    return { ok: false, code: "invalid" };
  }
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, code: "invalid" };
  let pending: PendingAction;
  try {
    pending = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as PendingAction;
  } catch {
    return { ok: false, code: "invalid" };
  }
  if (!pending?.actionId || !pending.userId || !pending.tool) return { ok: false, code: "invalid" };
  if (pending.userId !== userId) return { ok: false, code: "forbidden" };
  if (pending.exp < now) return { ok: false, code: "expired" };
  return { ok: true, pending };
}

export function humanPendingError(code: "invalid" | "expired" | "forbidden") {
  if (code === "expired") return "Cette confirmation a expiré. Relancez la demande.";
  if (code === "forbidden") return "Cette confirmation ne vous appartient pas.";
  return "Confirmation invalide.";
}
