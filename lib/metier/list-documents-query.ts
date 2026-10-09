/**
 * Helpers purs pour listDocuments (pagination + relations) —
 * testables sans DB ni server-only.
 */

export type DocumentListPaging = {
  /** Nombre max de documents (ordre created_at desc côté requête). Absente = pas de plafond. */
  limit?: number;
  /** Décalage (ignoré si limit est absent). */
  offset?: number;
};

export type DocumentListFilter = DocumentListPaging & {
  direction?: "in" | "out";
  chantierId?: string;
  kind?: string;
};

/** Normalise limit/offset ; refuse les valeurs invalides (clamp). */
export function normalizeDocumentListPaging(paging?: DocumentListPaging): {
  limit: number | null;
  offset: number;
} {
  const offset = Math.max(0, Math.floor(paging?.offset ?? 0));
  if (paging?.limit == null) return { limit: null, offset: 0 };
  const limit = Math.max(0, Math.floor(paging.limit));
  if (limit === 0) return { limit: 0, offset };
  return { limit, offset };
}

/** Slice mémoire (fallback local / tests). */
export function pageDocumentRows<T>(rows: T[], paging?: DocumentListPaging): T[] {
  const { limit, offset } = normalizeDocumentListPaging(paging);
  if (limit === null) return rows;
  if (limit === 0) return [];
  return rows.slice(offset, offset + limit);
}

/** IDs de relations réellement référencés (évite de charger tout le graphe user). */
export function relatedIdsFromDocuments(
  docs: ReadonlyArray<{ party_id: string | null; chantier_id: string | null }>,
): { partyIds: string[]; chantierIds: string[] } {
  const parties = new Set<string>();
  const chantiers = new Set<string>();
  for (const d of docs) {
    if (d.party_id) parties.add(d.party_id);
    if (d.chantier_id) chantiers.add(d.chantier_id);
  }
  return { partyIds: [...parties], chantierIds: [...chantiers] };
}

/**
 * Isolation ownership : un document n’appartient à viewer que si user_id match.
 * (Couche app — la RLS DB doit aussi filtrer ; ce prédicat documente la règle métier.)
 */
export function documentOwnedByViewer(
  documentUserId: string | null | undefined,
  viewerUserId: string,
): boolean {
  return Boolean(documentUserId) && documentUserId === viewerUserId;
}

/** USER B ne doit jamais voir les ids de A dans un résultat filtré. */
export function assertNoForeignDocumentIds(
  rows: ReadonlyArray<{ id: string }>,
  foreignIds: ReadonlyArray<string>,
): { ok: true } | { ok: false; leaked: string[] } {
  const foreign = new Set(foreignIds);
  const leaked = rows.map((r) => r.id).filter((id) => foreign.has(id));
  return leaked.length ? { ok: false, leaked } : { ok: true };
}
