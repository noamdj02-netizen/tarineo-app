/**
 * Préparation côté client avant upload — évite de dépendre de sharp/heic-convert serveur.
 * JPEG/PNG : renvoyés tels quels. HEIC : conversion canvas/heic2any si possible.
 */
export async function preparerFichierPourUpload(fichier: File): Promise<File> {
  const nom = fichier.name.toLowerCase();
  const estHeic =
    fichier.type === "image/heic" ||
    fichier.type === "image/heif" ||
    nom.endsWith(".heic") ||
    nom.endsWith(".heif");

  if (!estHeic) {
    return fichier;
  }

  try {
    const { default: heic2any } = await import("heic2any");
    const resultat = await heic2any({
      blob: fichier,
      toType: "image/jpeg",
      quality: 0.92,
    });
    const blob = Array.isArray(resultat) ? resultat[0] : resultat;
    if (!(blob instanceof Blob)) return fichier;
    const nouveauNom = fichier.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg");
    return new File([blob], nouveauNom, { type: "image/jpeg", lastModified: fichier.lastModified });
  } catch (erreur) {
    console.warn("Conversion HEIC client impossible, envoi du fichier original :", erreur);
    return fichier;
  }
}
