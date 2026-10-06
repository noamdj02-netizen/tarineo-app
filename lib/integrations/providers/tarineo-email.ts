import "server-only";
import { Resend } from "resend";
import type { ConnectionTestResult } from "../types";

/** Santé du service e-mail plateforme (Resend) — pas de secret exposé au client. */
export async function testTarineoEmailConnection(): Promise<ConnectionTestResult> {
  const checkedAt = new Date().toISOString();
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    return {
      integrationId: "tarineo_email",
      outcome: "misconfigured",
      message: "Le service d’e-mail n’est pas configuré sur cet environnement.",
      checkedAt,
    };
  }
  try {
    const resend = new Resend(key);
    const { error } = await resend.domains.list();
    if (error) {
      return {
        integrationId: "tarineo_email",
        outcome: "error",
        message: "Resend a refusé la connexion. Vérifiez la clé API ou le domaine.",
        checkedAt,
      };
    }
    return {
      integrationId: "tarineo_email",
      outcome: "ok",
      message: "Le service d’e-mail TARINEO répond correctement.",
      checkedAt,
    };
  } catch {
    return {
      integrationId: "tarineo_email",
      outcome: "error",
      message: "Impossible de joindre le service d’e-mail. Réessayez plus tard.",
      checkedAt,
    };
  }
}

export function tarineoEmailPlatformConnected(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
