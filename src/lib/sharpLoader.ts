import type Sharp from "sharp";

let sharpModule: typeof Sharp | null | undefined;

/**
 * Charge sharp à la demande — évite de faire planter le rendu d'une page si le binaire
 * linux-x64 n'est pas disponible sur Vercel (libvips manquant).
 */
export async function chargerSharp(): Promise<typeof Sharp | null> {
  if (sharpModule !== undefined) return sharpModule;
  try {
    const mod = await import("sharp");
    sharpModule = mod.default;
    return sharpModule;
  } catch (erreur) {
    console.warn("Module sharp indisponible, traitement image ignoré :", erreur);
    sharpModule = null;
    return null;
  }
}
