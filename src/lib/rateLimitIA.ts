import { verifierRateLimit } from "@/lib/rateLimit";

const LIMITE_ANALYSE_HEURE = 20;
const LIMITE_DEVIS_IA_HEURE = 20;
const LIMITE_RECHERCHE_FOURNISSEUR_HEURE = 15;

export function verifierRateLimitAnalyse(userId: string): boolean {
  return verifierRateLimit(`ia-analyse:${userId}`, LIMITE_ANALYSE_HEURE, 60 * 60 * 1000);
}

export function verifierRateLimitDevisIA(userId: string): boolean {
  return verifierRateLimit(`ia-devis:${userId}`, LIMITE_DEVIS_IA_HEURE, 60 * 60 * 1000);
}

export function verifierRateLimitRechercheFournisseur(userId: string): boolean {
  return verifierRateLimit(`ia-fournisseur:${userId}`, LIMITE_RECHERCHE_FOURNISSEUR_HEURE, 60 * 60 * 1000);
}
