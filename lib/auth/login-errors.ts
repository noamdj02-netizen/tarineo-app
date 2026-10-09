import type { AuthError } from "@supabase/supabase-js";

/** Messages login email / mot de passe (français, sans jargon technique). */
export function loginErrorMessage(error: AuthError): string {
  if (error.code === "email_not_confirmed") {
    return "Confirme d’abord ton email : clique sur le lien reçu à l’inscription.";
  }
  if (error.status === 429) {
    return "Trop d’essais. Attends un moment, puis réessaie.";
  }
  if (error.code === "invalid_credentials") {
    return "Email ou mot de passe incorrect. Si tu t’étais inscrit avec Google, utilise « Continuer avec Google ». Sinon, « Mot de passe oublié ».";
  }
  return "Connexion impossible pour le moment. Réessaie ou utilise Google / un lien par email.";
}
