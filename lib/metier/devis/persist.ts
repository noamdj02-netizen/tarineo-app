import "server-only";
import { createHash } from "node:crypto";
import { calculateQuoteTotals } from "@/lib/metier/devis/totals";
import { validateDevisDraft } from "@/lib/metier/devis/validate";
import type { DevisDraft } from "@/lib/metier/devis/types";
import { getDocument, listDocuments, saveExtractedDocument } from "@/lib/metier/queries";
import type { DocumentCard } from "@/lib/metier/types";

export type PersistDevisResult =
  | { ok: true; id: string; reused: boolean; totals: ReturnType<typeof calculateQuoteTotals> }
  | { ok: false; error: string };

/**
 * Pipeline unique : DevisDraft → validation → totaux serveur → persistence.
 * Idempotent si `idempotencyKey` fournie.
 */
export async function persistDevisDraft(raw: DevisDraft): Promise<PersistDevisResult> {
  const validated = validateDevisDraft(raw);
  if (!validated.ok) return { ok: false, error: validated.error };

  const draft = validated.draft;
  if (draft.source !== "template" && draft.source !== "manual") {
    const missingPrices = draft.lines.filter(
      (l) => l.unitPriceHT <= 0 || l.missing?.includes("prix"),
    );
    if (missingPrices.length) {
      const labels = missingPrices
        .slice(0, 3)
        .map((l) => l.description)
        .join(", ");
      return {
        ok: false,
        error: `Il me manque le prix : ${labels}${missingPrices.length > 3 ? "…" : ""}.`,
      };
    }
  }

  const totals = calculateQuoteTotals(draft.lines);
  const key =
    draft.idempotencyKey?.trim() ||
    createHash("sha256")
      .update(
        JSON.stringify({
          source: draft.source,
          client: draft.client.name,
          chantier: draft.chantier?.id ?? draft.chantier?.name ?? null,
          lines: draft.lines,
          title: draft.title ?? null,
        }),
      )
      .digest("hex")
      .slice(0, 32);

  const existing = await findByIdempotencyKey(key);
  if (existing) {
    return { ok: true, id: existing.id, reused: true, totals };
  }

  const title =
    draft.title?.trim() ||
    (draft.source === "voice" ? "Devis — brouillon vocal" : "Devis");

  try {
    const doc = await saveExtractedDocument({
      title: title.slice(0, 120),
      direction: "out",
      kind: "devis",
      partyName: draft.client.name.trim() || "Client",
      partyKind: "client",
      chantierId: draft.chantier?.id || null,
      extract: {
        source: draft.source,
        idempotency_key: key,
        draft: true,
        notes: draft.notes ?? null,
        validity_days: draft.validityDays ?? 30,
        payment_terms: draft.paymentTerms ?? null,
        vat_mode: draft.vatMode ?? "standard",
        questions: draft.questions ?? [],
        warnings: draft.warnings ?? [],
        totals: {
          ht: totals.totalHT,
          tva: totals.totalTVA,
          ttc: totals.totalTTC,
          eco_contribution: null,
          pmcb: null,
          weight_kg: null,
        },
        line_vat_rates: draft.lines.map((l) => l.vatRate),
        client_query: draft.client.query ?? null,
      },
      lines: draft.lines.map((l) => ({
        label: l.description,
        qty: l.quantity,
        unit: l.unit || "u",
        buy_price: 0,
        sell_price: l.unitPriceHT,
      })),
    });
    try {
      const { notifyQuoteReady } = await import("@/lib/notifications/emitters");
      const saved = await getDocument(doc.id);
      if (saved) await notifyQuoteReady(saved);
    } catch (err) {
      console.error("[persistDevisDraft] notify", err);
    }
    return { ok: true, id: doc.id, reused: false, totals };
  } catch (err) {
    console.error("[persistDevisDraft]", err);
    return { ok: false, error: "Impossible d’enregistrer le devis." };
  }
}

async function findByIdempotencyKey(key: string): Promise<DocumentCard | null> {
  if (!key) return null;
  const docs = await listDocuments({ direction: "out", kind: "devis" });
  const hit = docs.find((d) => d.extract?.idempotency_key === key);
  if (!hit) return null;
  return (await getDocument(hit.id)) ?? hit;
}
