/** URLs post-import (modale, onboarding, page documents). */

export function urlAnalysesEnCours(documentIds: string[], retour?: string) {
  const params = new URLSearchParams({ ids: documentIds.join(",") });
  params.set("retour", retour ?? "/analyses?import=1");
  return `/documents/analyses-en-cours?${params.toString()}`;
}

export function hrefApresImportDocuments(documentIds: string[]): string {
  if (documentIds.length === 1) return `/documents/${documentIds[0]}`;
  return urlAnalysesEnCours(documentIds);
}
