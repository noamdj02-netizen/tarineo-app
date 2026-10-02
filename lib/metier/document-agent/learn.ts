import "server-only";
import type { DocDirection, DocKind, ExtractResult, PartyKind } from "@/lib/metier/types";
import { structuralDiff } from "@/lib/metier/document-agent/learn-diff";
import { hintDeltaHash, isSafeHintDelta } from "@/lib/metier/document-agent/learn-guards";
import { recordContributionAndMaybeMerge } from "@/lib/metier/document-agent/profiles";
import { getDb } from "@/lib/db";

/**
 * Apprentissage communautaire : uniquement signaux structurels (pas de libellés ni montants).
 * Consensus ≥ 3 utilisateurs distincts avant fusion dans vendor_document_profiles.
 */
export { structuralDiff } from "@/lib/metier/document-agent/learn-diff";

export async function learnFromConfirmation(input: {
  vendorKey: string;
  rawExtract: ExtractResult | null | undefined;
  confirmed: {
    kind: DocKind;
    direction: DocDirection;
    partyKind: PartyKind;
    totals?: { ht?: number | null };
    lines: { label: string }[];
  };
}): Promise<void> {
  const delta = structuralDiff(input.rawExtract, input.confirmed);
  if (!isSafeHintDelta(delta)) return;

  const db = await getDb();
  if (!db?.user?.id) return;

  const hintHash = hintDeltaHash(delta);
  await recordContributionAndMaybeMerge({
    userId: db.user.id,
    vendorKey: input.vendorKey,
    kind: input.confirmed.kind,
    hintDelta: delta as Record<string, unknown>,
    hintHash,
  });
}
