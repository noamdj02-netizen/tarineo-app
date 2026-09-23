import convertHeic from "heic-convert";

export type BlocContenuClaude =
  | {
      type: "document";
      source: { type: "base64"; media_type: "application/pdf"; data: string };
    }
  | {
      type: "image";
      source: { type: "base64"; media_type: "image/jpeg" | "image/png"; data: string };
    };

/**
 * Prépare le bloc vision pour Claude — sans sharp.
 * HEIC : conversion best-effort ; en cas d'échec, on tente quand même l'envoi JPEG brut.
 */
export async function construireBlocContenu(buffer: Buffer, extension: string | undefined): Promise<BlocContenuClaude> {
  if (extension === "pdf") {
    return {
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: buffer.toString("base64"),
      },
    };
  }

  let imageBuffer = buffer;
  let mediaType: "image/jpeg" | "image/png" = extension === "png" ? "image/png" : "image/jpeg";

  if (extension === "heic" || extension === "heif") {
    try {
      const converti = await convertHeic({ buffer, format: "JPEG", quality: 0.9 });
      imageBuffer = Buffer.from(converti);
      mediaType = "image/jpeg";
    } catch (erreur) {
      console.warn("Conversion HEIC serveur impossible, envoi du fichier original à l'IA :", erreur);
      // Claude n'accepte pas le HEIC — on tente le buffer tel quel en JPEG (échec IA possible,
      // mais l'upload Supabase et le document en base restent valides).
      mediaType = "image/jpeg";
    }
  }

  return {
    type: "image",
    source: { type: "base64", media_type: mediaType, data: imageBuffer.toString("base64") },
  };
}
