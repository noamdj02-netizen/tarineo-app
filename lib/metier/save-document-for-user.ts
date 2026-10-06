import "server-only";

import type { createAdminClient } from "@/lib/supabase/admin";
import type { DocumentCard, DocumentLine, DocumentRow, Party } from "@/lib/metier/types";

type Admin = ReturnType<typeof createAdminClient>;

/** Persiste un document extrait pour un user_id (API / cron, sans session navigateur). */
export async function saveExtractedDocumentForUser(
  admin: Admin,
  userId: string,
  input: {
    title: string;
    direction: DocumentRow["direction"];
    kind: DocumentRow["kind"];
    partyName: string;
    partyKind: Party["kind"];
    chantierId: string | null;
    filePath?: string;
    extract: Record<string, unknown>;
    lines: Array<{ label: string; qty: number; unit: string; buy_price: number; sell_price?: number }>;
  },
): Promise<DocumentCard> {
  if (input.chantierId) {
    const { data: ch } = await admin
      .from("chantiers")
      .select("id")
      .eq("id", input.chantierId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!ch) input.chantierId = null;
  }

  if (input.filePath) {
    const { data: byFile } = await admin
      .from("documents")
      .select("id")
      .eq("user_id", userId)
      .eq("file_path", input.filePath)
      .limit(1);
    if (byFile?.[0]?.id) {
      const existing = await getDocumentForUser(admin, userId, byFile[0].id);
      if (existing) return existing;
    }
  }

  let partyId: string | null = null;
  const { data: existingParty } = await admin
    .from("parties")
    .select("id")
    .eq("user_id", userId)
    .eq("name", input.partyName)
    .eq("kind", input.partyKind)
    .maybeSingle();
  if (existingParty) partyId = existingParty.id;
  else {
    const { data: created } = await admin
      .from("parties")
      .insert({ user_id: userId, kind: input.partyKind, name: input.partyName })
      .select("id")
      .single();
    partyId = created?.id ?? null;
  }

  const { data: doc, error } = await admin
    .from("documents")
    .insert({
      user_id: userId,
      direction: input.direction,
      kind: input.kind,
      title: input.title,
      party_id: partyId,
      chantier_id: input.chantierId,
      file_path: input.filePath ?? "",
      extract: input.extract,
      status: "ready",
    })
    .select("id")
    .single();
  if (error || !doc) throw new Error("Le document n’a pas pu être enregistré.");

  if (input.lines.length) {
    await admin.from("document_lines").insert(
      input.lines.map((l, i) => ({
        user_id: userId,
        document_id: doc.id,
        label: l.label,
        qty: l.qty,
        unit: l.unit,
        buy_price: l.buy_price,
        sell_price: l.sell_price ?? (input.direction === "out" ? l.buy_price : 0),
        position: i,
        supplier_party_id: input.partyKind === "fournisseur" ? partyId : null,
        distributor_party_id: input.partyKind === "distributeur" ? partyId : null,
      })),
    );
  }

  const full = await getDocumentForUser(admin, userId, doc.id);
  if (!full) throw new Error("Document introuvable après création.");
  return full;
}

export async function getDocumentForUser(
  admin: Admin,
  userId: string,
  documentId: string,
): Promise<DocumentCard | null> {
  const docs = await listDocumentsForUserShort(admin, userId, documentId);
  return docs[0] ?? null;
}

async function listDocumentsForUserShort(
  admin: Admin,
  userId: string,
  documentId?: string,
): Promise<DocumentCard[]> {
  let q = admin
    .from("documents")
    .select(
      "id, direction, kind, title, party_id, chantier_id, source_document_id, file_path, extract, status, error, seed_key, created_at",
    )
    .eq("user_id", userId);
  if (documentId) q = q.eq("id", documentId);
  const { data: docs } = await q.order("created_at", { ascending: false }).limit(documentId ? 1 : 200);
  const rows = docs ?? [];
  if (!rows.length) return [];

  const [{ data: parties }, { data: chantiers }, { data: lines }] = await Promise.all([
    admin.from("parties").select("id, name, kind, address").eq("user_id", userId),
    admin.from("chantiers").select("id, name, slug").eq("user_id", userId),
    admin.from("document_lines").select("*").eq("user_id", userId),
  ]);
  const pMap = new Map((parties ?? []).map((p) => [p.id, p]));
  const cMap = new Map((chantiers ?? []).map((c) => [c.id, c]));
  return rows.map((d) => {
    const p = d.party_id ? pMap.get(d.party_id) : undefined;
    const c = d.chantier_id ? cMap.get(d.chantier_id) : undefined;
    return {
      ...d,
      extract: (d.extract ?? {}) as Record<string, unknown>,
      party_name: p?.name ?? null,
      party_address: p?.address ?? null,
      party_kind: p?.kind ?? null,
      chantier_name: c?.name ?? null,
      chantier_slug: c?.slug ?? null,
      lines: (lines ?? []).filter((l) => l.document_id === d.id) as DocumentLine[],
    } as DocumentCard;
  });
}

export async function listDocumentsForUserApi(
  admin: Admin,
  userId: string,
  limit = 50,
): Promise<DocumentCard[]> {
  return listDocumentsForUserShort(admin, userId).then((all) => all.slice(0, limit));
}
