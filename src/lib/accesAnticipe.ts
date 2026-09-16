import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "./prisma";

// Accès anticipé limité au lancement de Tarineo. Deux seuils :
//  - à partir de ACCES_ANTICIPE_SEUIL_URGENCE inscrits, la page d'accueil affiche un
//    compteur précis ("X/100 places prises") pour créer un effet d'urgence sur la fin ;
//  - à ACCES_ANTICIPE_LIMITE_TOTAL, l'inscription (Credentials et Google) est bloquée
//    et remplacée par la liste d'attente (voir src/app/inscription/).
export const ACCES_ANTICIPE_LIMITE_TOTAL = 100;
export const ACCES_ANTICIPE_SEUIL_URGENCE = 70;

const TAG_CACHE_ACCES = "acces-anticipe";

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

async function compterInscrits(): Promise<EtatAccesAnticipe> {
  try {
    return calculerEtatAccesAnticipe(await prisma.user.count());
  } catch {
    return calculerEtatAccesAnticipe(0);
  }
}

/** Compte mis en cache 2 min — évite un aller-retour Supabase sur chaque visite de /. */
export const etatAccesAnticipeDepuisDb = unstable_cache(compterInscrits, ["acces-anticipe-count"], {
  revalidate: 120,
  tags: [TAG_CACHE_ACCES],
});

export function invaliderCacheAccesAnticipe(): void {
  revalidateTag(TAG_CACHE_ACCES, "max");
}
