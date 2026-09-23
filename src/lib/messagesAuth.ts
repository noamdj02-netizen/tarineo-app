/** Messages Auth.js affichés sur /connexion — remplace les codes bruts par du français. */
export function messageErreurAuth(code: string | undefined | null): string | null {
  if (!code) return null;

  switch (code) {
    case "OAuthAccountNotLinked":
      return "Un compte existe déjà avec cet email. Connectez-vous avec votre mot de passe, ou utilisez Google avec la même adresse.";
    case "CompteExistant":
      return "Un compte existe déjà avec cet email. Connectez-vous avec votre mot de passe.";
    case "EmailNonVerifie":
      return "Google n'a pas confirmé votre adresse email. Utilisez la connexion par mot de passe.";
    case "InvalidCheck":
      return "La connexion a expiré (session OAuth). Fermez l'onglet, revenez sur app.tarineo.com et réessayez.";
    case "AccessDenied":
      return "Connexion refusée. Réessayez ou contactez le support.";
    case "Configuration":
      return "Connexion temporairement indisponible. Réessayez dans quelques minutes.";
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
    case "CallbackRouteError":
      return "La connexion Google a échoué. Réessayez ou connectez-vous avec votre mot de passe.";
    case "CredentialsSignin":
      return "Email ou mot de passe incorrect.";
    case "SessionRequired":
      return "Vous devez être connecté pour accéder à cette page.";
    default:
      return "La connexion a échoué. Réessayez.";
  }
}
