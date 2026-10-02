import type { createAdminClient } from "@/lib/supabase/admin";
import type { DocumentCard } from "@/lib/metier/types";
import type { CompanyProfile } from "@/lib/metier/company";

type Admin = ReturnType<typeof createAdminClient>;

export async function listDocumentsForUser(admin: Admin, userId: string): Promise<DocumentCard[]> {
  const { data: docs } = await admin
    .from("documents")
    .select(
      "id, direction, kind, title, party_id, chantier_id, source_document_id, file_path, extract, status, error, seed_key, created_at",
    )
    .eq("user_id", userId);
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
      lines: (lines ?? []).filter((l) => l.document_id === d.id),
    } as DocumentCard;
  });
}

export async function getCompanyProfileForUser(admin: Admin, userId: string): Promise<CompanyProfile | null> {
  const { data } = await admin.from("company_profiles").select("*").eq("user_id", userId).maybeSingle();
  return (data as CompanyProfile | null) ?? null;
}
