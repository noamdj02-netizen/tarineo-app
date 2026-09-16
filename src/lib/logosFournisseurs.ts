import { trouverFournisseurConnu } from "@/lib/fournisseursConnus";

/**
 * URL du logo de l'enseigne (servi par logo.dev), ou null si aucun logo vérifié n'est
 * disponible — l'appelant affiche alors un monogramme (voir BrandMark).
 */
export function logoFournisseur(nom: string): string | null {
  return trouverFournisseurConnu(nom)?.logo ?? null;
}
