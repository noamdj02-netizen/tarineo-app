/**
 * Déclenche l'analyse IA d'un document côté serveur (route API).
 * Retourne false si la requête réseau échoue — le polling pourra relancer.
 */
export async function declencherAnalyseDocument(documentId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/documents/${documentId}/analyser`, {
      method: "POST",
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
