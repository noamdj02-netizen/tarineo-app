import "server-only";
import { loadConnectorSignals } from "@/lib/connectors/signals";
import { createClient } from "@/lib/supabase/server";
import type { ConnectionTestResult } from "../types";

/** Vérifie le bind Google + présence d’un token OAuth utilisable. */
export async function testGoogleConnection(): Promise<ConnectionTestResult> {
  const checkedAt = new Date().toISOString();
  const signals = await loadConnectorSignals();
  const gmail = signals.connections.gmail;
  if (!gmail) {
    return {
      integrationId: "google",
      outcome: "not_connected",
      message: "Google n’est pas connecté. Utilisez « Connecter Google ».",
      checkedAt,
    };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.provider_token;
  if (!token) {
    return {
      integrationId: "google",
      outcome: "reconnection_required",
      message:
        "La session Google a expiré. Cliquez sur « Reconnecter » pour réautoriser TARINEO.",
      checkedAt,
    };
  }

  try {
    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: { authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 401 || res.status === 403) {
      return {
        integrationId: "google",
        outcome: "reconnection_required",
        message: "Google refuse l’accès Gmail. Reconnectez votre compte.",
        checkedAt,
      };
    }
    if (!res.ok) {
      return {
        integrationId: "google",
        outcome: "error",
        message: `Google a répondu ${res.status}. Réessayez ou reconnectez le compte.`,
        checkedAt,
      };
    }
    const body = (await res.json()) as { emailAddress?: string };
    const addr = body.emailAddress ?? gmail.label ?? signals.googleEmail;
    return {
      integrationId: "google",
      outcome: "ok",
      message: addr
        ? `Compte Gmail accessible (${addr}). Les relances passent encore par E-mails TARINEO.`
        : "Compte Gmail accessible. Les relances passent encore par E-mails TARINEO.",
      checkedAt,
    };
  } catch {
    return {
      integrationId: "google",
      outcome: "error",
      message: "Impossible de joindre Google. Vérifiez votre connexion internet.",
      checkedAt,
    };
  }
}
