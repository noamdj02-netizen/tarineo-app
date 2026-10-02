import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDb } from "@/lib/db";
import type { DocKind } from "@/lib/metier/types";
import type { LayoutHints, VendorDocumentProfile } from "@/lib/metier/document-agent/types";
import { vendorDisplayName } from "@/lib/metier/document-agent/vendor-key";

const FALLBACK: VendorDocumentProfile[] = [
  {
    vendor_key: "cedeo",
    vendor_display_name: "Cedeo",
    kind: null,
    layout_hints: { header_markers: ["Cedeo"], column_order: ["ref", "designation", "qty", "unit", "pu_ht"] },
    prompt_addon:
      "Document Cedeo : repère l’en-tête Cedeo ; tableau souvent avec Réf., Désignation, Qté, U, PU HT ; totaux en bas (Total HT / TVA / TTC).",
    version: 1,
    sample_count: 0,
  },
  {
    vendor_key: "point_p",
    vendor_display_name: "Point.P",
    kind: null,
    layout_hints: { header_markers: ["Point.P", "Point P"], column_order: ["ref", "designation", "qty", "unit", "pu_ht"] },
    prompt_addon:
      "Document Point.P : logo Point.P en en-tête ; lignes avec référence article, libellé, quantité, unité, prix unitaire HT ; adresse chantier souvent en bloc livraison.",
    version: 1,
    sample_count: 0,
  },
];

function rowToProfile(row: {
  vendor_key: string;
  vendor_display_name: string;
  kind: string | null;
  layout_hints: unknown;
  prompt_addon: string;
  version: number;
  sample_count: number;
}): VendorDocumentProfile {
  return {
    vendor_key: row.vendor_key,
    vendor_display_name: row.vendor_display_name || vendorDisplayName(row.vendor_key),
    kind: (row.kind as DocKind | null) ?? null,
    layout_hints: (row.layout_hints && typeof row.layout_hints === "object" ? row.layout_hints : {}) as LayoutHints,
    prompt_addon: row.prompt_addon ?? "",
    version: row.version ?? 1,
    sample_count: row.sample_count ?? 0,
  };
}

/** Charge le profil communautaire le plus pertinent (kind spécifique puis générique). */
export async function loadVendorProfile(vendorKey: string, kind: DocKind | null): Promise<VendorDocumentProfile | null> {
  if (vendorKey === "unknown") return null;

  const db = await getDb();
  if (!db) {
    return (
      FALLBACK.find((p) => p.vendor_key === vendorKey) ??
      ({
        vendor_key: vendorKey,
        vendor_display_name: vendorDisplayName(vendorKey),
        kind: null,
        layout_hints: {},
        prompt_addon: "",
        version: 0,
        sample_count: 0,
      } satisfies VendorDocumentProfile)
    );
  }

  if (kind) {
    const { data: specific } = await db.supabase
      .from("vendor_document_profiles")
      .select("vendor_key, vendor_display_name, kind, layout_hints, prompt_addon, version, sample_count")
      .eq("vendor_key", vendorKey)
      .eq("kind", kind)
      .maybeSingle();

    if (specific) return rowToProfile(specific);
  }

  const { data: generic } = await db.supabase
    .from("vendor_document_profiles")
    .select("vendor_key, vendor_display_name, kind, layout_hints, prompt_addon, version, sample_count")
    .eq("vendor_key", vendorKey)
    .is("kind", null)
    .maybeSingle();

  if (generic) return rowToProfile(generic);

  return FALLBACK.find((p) => p.vendor_key === vendorKey) ?? null;
}

export function buildPromptAddonFromHints(hints: LayoutHints, baseAddon: string): string {
  const parts: string[] = [];
  if (baseAddon.trim()) parts.push(baseAddon.trim());
  if (hints.column_order?.length) {
    parts.push(`Ordre de colonnes habituel : ${hints.column_order.join(", ")}.`);
  }
  if (hints.total_labels?.length) {
    parts.push(`Libellés de totaux : ${hints.total_labels.join(", ")}.`);
  }
  if (hints.header_markers?.length) {
    parts.push(`Repères en-tête : ${hints.header_markers.join(", ")}.`);
  }
  return parts.join("\n");
}

const CONSENSUS_USERS = 3;

/** Enregistre une contribution et fusionne le profil si consensus atteint (service role). */
export async function recordContributionAndMaybeMerge(input: {
  userId: string;
  vendorKey: string;
  kind: DocKind;
  hintDelta: Record<string, unknown>;
  hintHash: string;
}): Promise<void> {
  if (input.vendorKey === "unknown") return;

  let admin: ReturnType<typeof createAdminClient> | null = null;
  try {
    admin = createAdminClient();
  } catch {
    return;
  }

  await admin.from("vendor_profile_contributions").insert({
    user_id: input.userId,
    vendor_key: input.vendorKey,
    kind: input.kind,
    hint_delta: input.hintDelta,
    hint_hash: input.hintHash,
  });

  const { data: rows } = await admin
    .from("vendor_profile_contributions")
    .select("user_id")
    .eq("vendor_key", input.vendorKey)
    .eq("kind", input.kind)
    .eq("hint_hash", input.hintHash);

  const distinctUsers = new Set((rows ?? []).map((r) => r.user_id));
  if (distinctUsers.size < CONSENSUS_USERS) return;

  const { data: profile } = await admin
    .from("vendor_document_profiles")
    .select("*")
    .eq("vendor_key", input.vendorKey)
    .is("kind", null)
    .maybeSingle();

  const prevHints = (profile?.layout_hints && typeof profile.layout_hints === "object"
    ? profile.layout_hints
    : {}) as LayoutHints;
  const learned = [...(prevHints.learned ?? []), input.hintDelta].slice(-20);

  const nextHints: LayoutHints = { ...prevHints, learned };
  const baseAddon = profile?.prompt_addon ?? "";
  const prompt_addon = buildPromptAddonFromHints(nextHints, baseAddon);

  if (profile?.id) {
    await admin
      .from("vendor_document_profiles")
      .update({
        layout_hints: nextHints,
        prompt_addon,
        version: (profile.version ?? 1) + 1,
        sample_count: (profile.sample_count ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);
  } else {
    await admin.from("vendor_document_profiles").insert({
      vendor_key: input.vendorKey,
      vendor_display_name: vendorDisplayName(input.vendorKey),
      kind: null,
      layout_hints: nextHints,
      prompt_addon,
      version: 1,
      sample_count: 1,
    });
  }
}
