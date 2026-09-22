import { chargerEtatOnboarding } from "@/lib/onboarding";
import { utilisateurDoitConfirmerEmail } from "@/lib/confirmationEmail";

/** Destination par défaut une fois le parcours d'accueil/onboarding clarifié. */
export const ROUTE_APRES_AUTH = "/accueil";

/** Hub intermédiaire après signIn — résout la destination selon onboarding / callbackUrl. */
export const ROUTE_HUB_APRES_CONNEXION = "/apres-connexion";

/** Vérifie qu'une URL de retour est un chemin interne (anti open-redirect). */
export function estCallbackUrlInterne(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return false;
  if (trimmed.includes("://") || trimmed.includes("..")) return false;
  if (trimmed.startsWith("/connexion") || trimmed.startsWith("/inscription")) return false;
  return true;
}

export function lienHubApresConnexion(callbackUrl?: string | null): string {
  if (callbackUrl && estCallbackUrlInterne(callbackUrl)) {
    return `${ROUTE_HUB_APRES_CONNEXION}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }
  return ROUTE_HUB_APRES_CONNEXION;
}

export async function resoudreRouteApresAuth(userId: string, callbackUrl?: string | null): Promise<string> {
  if (callbackUrl && estCallbackUrlInterne(callbackUrl)) {
    return callbackUrl;
  }

  if (await utilisateurDoitConfirmerEmail(userId)) {
    return "/confirmer-email";
  }

  const etat = await chargerEtatOnboarding(userId);
  if (etat.doitVoirChoixImport) {
    return "/onboarding";
  }

  return ROUTE_APRES_AUTH;
}

export function doitForcerOnboarding(pathname: string): boolean {
  if (pathname.startsWith("/onboarding")) return false;
  if (pathname.startsWith("/invitation")) return false;
  if (pathname.startsWith("/legal")) return false;
  if (pathname.startsWith("/confirmer-email")) return false;
  return true;
}

export function estRouteConfirmationEmail(pathname: string): boolean {
  return pathname.startsWith("/confirmer-email");
}
