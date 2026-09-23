const MESSAGE_RESEAU = "Connexion interrompue. Vérifiez votre réseau et réessayez.";
const MESSAGE_SERVEUR = "Un problème est survenu de notre côté. Réessayez dans un instant.";

export function messageErreurEnvoiDocument(erreur: unknown): { message: string; type: "reseau" | "serveur" } {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { message: MESSAGE_RESEAU, type: "reseau" };
  }

  if (erreur instanceof TypeError) {
    return { message: MESSAGE_RESEAU, type: "reseau" };
  }

  if (erreur instanceof Error) {
    const msg = erreur.message.toLowerCase();
    if (
      msg.includes("failed to fetch") ||
      msg.includes("network") ||
      msg.includes("load failed") ||
      msg.includes("aborted")
    ) {
      return { message: MESSAGE_RESEAU, type: "reseau" };
    }
  }

  return { message: MESSAGE_SERVEUR, type: "serveur" };
}

export async function journaliserErreurUploadServeur(
  erreur: unknown,
  contexte: Record<string, string>,
): Promise<void> {
  if (process.env.NODE_ENV !== "production") return;
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(erreur, { extra: contexte, tags: { zone: "upload_document" } });
  } catch {
    // Sentry non configuré — rien à faire.
  }
}
