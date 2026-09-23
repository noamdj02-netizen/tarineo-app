/** Type minimal sharp — aucun import du module natif à la compilation. */
export type SharpInstance = {
  (input?: Buffer | Uint8Array, options?: { pages?: number; density?: number }): {
    png(): { toBuffer(): Promise<Buffer> };
    metadata(): Promise<{ width?: number; height?: number }>;
    extract(region: { left: number; top: number; width: number; height: number }): {
      resize(w: number, h: number, opts?: object): { png(): { toBuffer(): Promise<Buffer> } };
    };
  };
};

let sharpModule: SharpInstance | null | undefined;

/**
 * Charge sharp à la demande — jamais au chargement du module appelant.
 * Retourne null si libvips indisponible (Vercel linux-x64, etc.).
 */
export async function chargerSharp(): Promise<SharpInstance | null> {
  if (sharpModule !== undefined) return sharpModule;
  try {
    const mod = await import("sharp");
    sharpModule = mod.default as SharpInstance;
    return sharpModule;
  } catch (erreur) {
    console.warn("Module sharp indisponible, traitement image ignoré :", erreur);
    sharpModule = null;
    return null;
  }
}
