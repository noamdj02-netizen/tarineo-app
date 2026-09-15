import { prisma } from "./prisma";

// Accès anticipé limité au lancement de Tarineo. Deux seuils :
//  - à partir de ACCES_ANTICIPE_SEUIL_URGENCE inscrits, la page d'accueil affiche un
//    compteur précis ("X/100 places prises") pour créer un effet d'urgence sur la fin ;
//  - à ACCES_ANTICIPE_LIMITE_TOTAL, l'inscription (Credentials et Google) est bloquée
//    et remplacée par la liste d'attente (voir src/app/inscription/).
export const ACCES_ANTICIPE_LIMITE_TOTAL = 100;
export const ACCES_ANTICIPE_SEUIL_URGENCE = 70;

export type EtatAccesAnticipe =
  | { phase: "disponible"; inscrits: number }
  | { phase: "urgence"; inscrits: number; restantes: number }
  | { phase: "complete"; inscrits: number };

export function calculerEtatAccesAnticipe(inscrits: number): EtatAccesAnticipe {
  if (inscrits >= ACCES_ANTICIPE_LIMITE_TOTAL) {
    return { phase: "complete", inscrits };
  }
  if (inscrits >= ACCES_ANTICIPE_SEUIL_URGENCE) {
    return { phase: "urgence", inscrits, restantes: ACCES_ANTICIPE_LIMITE_TOTAL - inscrits };
  }
  return { phase: "disponible", inscrits };
}

/** Compte les inscrits ; si la DB est injoignable, retourne phase « disponible » (0 inscrits). */
export async function etatAccesAnticipeDepuisDb(): Promise<EtatAccesAnticipe> {
  try {
    return calculerEtatAccesAnticipe(await prisma.user.count());
  } catch {
    return calculerEtatAccesAnticipe(0);
  }
}
