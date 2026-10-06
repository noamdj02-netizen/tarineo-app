import "server-only";

import { hashApiKey, looksLikeApiKey, safeEqualHex } from "@/lib/mcp/api-keys";
import { data } from "@/lib/mcp/data";
import { hasApiScope } from "@/lib/integrations/api-key-scopes";
import type { Scope } from "@/lib/mcp/types";

export type ApiKeyAuthContext = {
  userId: string;
  keyId: string;
  scopes: Scope[];
};

export function bearerFromRequest(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (!h?.toLowerCase().startsWith("bearer ")) return null;
  const token = h.slice(7).trim();
  return token || null;
}

export async function authenticateApiKey(
  token: string | null | undefined,
): Promise<{ ok: true; ctx: ApiKeyAuthContext } | { ok: false; reason: "missing" | "invalid" }> {
  if (!token || !looksLikeApiKey(token)) return { ok: false, reason: "missing" };
  const hash = hashApiKey(token);
  const record = await data.findApiKeyByHash(hash);
  if (!record || record.revokedAt || !safeEqualHex(record.hash, hash)) {
    return { ok: false, reason: "invalid" };
  }
  data.touchApiKey(record.id).catch(() => {});
  return {
    ok: true,
    ctx: { userId: record.userId, keyId: record.id, scopes: record.scopes },
  };
}

export function requireScope(ctx: ApiKeyAuthContext, scope: Scope): boolean {
  return hasApiScope(ctx.scopes, scope);
}
