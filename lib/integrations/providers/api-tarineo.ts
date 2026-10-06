import "server-only";
import { data } from "@/lib/mcp/data";
import { getDb } from "@/lib/db";
import type { ConnectionTestResult } from "../types";

export async function testApiTarineoConnection(): Promise<ConnectionTestResult> {
  const checkedAt = new Date().toISOString();
  const db = await getDb();
  if (!db) {
    return {
      integrationId: "api_tarineo",
      outcome: "not_connected",
      message: "Connectez-vous pour gérer les clés API.",
      checkedAt,
    };
  }
  const keys = await data.listApiKeys(db.user.id).catch(() => []);
  const active = keys.filter((k) => !k.revokedAt);
  if (active.length === 0) {
    return {
      integrationId: "api_tarineo",
      outcome: "not_connected",
      message: "Aucune clé API active. Créez-en une dans Compte.",
      checkedAt,
    };
  }
  return {
    integrationId: "api_tarineo",
    outcome: "ok",
    message: `${active.length} clé${active.length > 1 ? "s" : ""} active${active.length > 1 ? "s" : ""}. Dernière utilisation : ${
      active.some((k) => k.lastUsedAt) ? "oui" : "pas encore"
    }.`,
    checkedAt,
  };
}
