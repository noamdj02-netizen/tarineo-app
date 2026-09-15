import crypto from "node:crypto";

// Durée de validité du lien de réinitialisation envoyé par email.
export const DUREE_VALIDITE_MS = 60 * 60 * 1000; // 1 heure

// Le token brut (haute entropie, 256 bits) part dans l'email ; seul son hash SHA-256
// est stocké en base (table VerificationToken, réutilisée telle quelle depuis le schéma
// Auth.js — plus utilisée pour le lien magique depuis le passage au mot de passe).
// Un hash rapide suffit ici (contrairement à bcrypt pour les mots de passe) : le token
// est déjà aléatoire sur 256 bits, pas un secret choisi par un humain à protéger contre
// le brute-force par dictionnaire.
export function hacherToken(tokenBrut: string): string {
  return crypto.createHash("sha256").update(tokenBrut).digest("hex");
}

export function genererTokenReinitialisation(): { tokenBrut: string; tokenHache: string; expires: Date } {
  const tokenBrut = crypto.randomBytes(32).toString("hex");
  return {
    tokenBrut,
    tokenHache: hacherToken(tokenBrut),
    expires: new Date(Date.now() + DUREE_VALIDITE_MS),
  };
}
