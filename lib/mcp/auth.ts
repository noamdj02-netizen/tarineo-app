import type { AuthInfo } from "@modelcontextprotocol/server";
import { data } from "./data";
import { hashApiKey, looksLikeApiKey, safeEqualHex } from "./api-keys";
import type { Scope } from "./types";

// Appelé par withMcpAuth à chaque requête MCP.
// Retourne undefined => 401 automatique.
export async function verifyNavpitToken(
  _req: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> {
  if (!looksLikeApiKey(bearerToken)) return undefined;

  const hash = hashApiKey(bearerToken);
  const record = await data.findApiKeyByHash(hash);
  if (!record || record.revokedAt || !safeEqualHex(record.hash, hash)) return undefined;

  // Non bloquant : on ne fait pas attendre l'agent pour ça.
  data.touchApiKey(record.id).catch(() => {});

  return {
    token: bearerToken,
    clientId: record.id,
    scopes: record.scopes,
    extra: { userId: record.userId, keyName: record.name },
  };
}

export class McpAuthError extends Error {}

// Récupère le userId depuis le contexte d'un tool.
export function getUserId(authInfo: AuthInfo | undefined): string {
  const userId = authInfo?.extra?.userId;
  if (typeof userId !== "string") throw new McpAuthError("Non authentifié.");
  return userId;
}

export function requireScope(authInfo: AuthInfo | undefined, scope: Scope): void {
  if (!authInfo?.scopes.includes(scope)) {
    throw new McpAuthError(
      `Cette clé API n'a pas le droit "${scope}". Crée une clé avec l'accès écriture dans Navpit > Compte > Clés API.`
    );
  }
}
