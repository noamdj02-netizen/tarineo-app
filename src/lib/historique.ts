// Un distributeur ne devient "comparable" qu'à partir de son 2e document validé
// (voir comparerLignesAuHistorique dans comparaisonPrix.ts : il faut un achat
// précédent pour avoir une base de comparaison). Tant qu'aucun distributeur n'atteint
// ce seuil, les alertes de hausse de prix ne peuvent rien détecter.
export function historiqueEstSuffisant(
  historique: { distributorNorm: string; documentId: string }[]
): boolean {
  const documentsParDistributeur = new Map<string, Set<string>>();
  for (const h of historique) {
    const documents = documentsParDistributeur.get(h.distributorNorm) ?? new Set<string>();
    documents.add(h.documentId);
    documentsParDistributeur.set(h.distributorNorm, documents);
  }
  return [...documentsParDistributeur.values()].some((documents) => documents.size >= 2);
}
