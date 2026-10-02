import { z } from "zod";
import type { DevisDraft, DevisLine } from "@/lib/metier/devis/types";

const lineSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().finite().positive().max(1_000_000),
  unit: z.string().trim().max(32).optional(),
  unitPriceHT: z.number().finite().min(0).max(10_000_000),
  vatRate: z.number().finite().min(0).max(100),
  missing: z.array(z.string()).optional(),
  note: z.string().nullable().optional(),
});

const draftSchema = z.object({
  client: z.object({
    id: z.string().nullable().optional(),
    name: z.string().trim().min(1).max(200),
    query: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
  }),
  chantier: z
    .object({
      id: z.string().nullable().optional(),
      name: z.string().nullable().optional(),
      address: z.string().nullable().optional(),
    })
    .optional(),
  lines: z.array(lineSchema).min(0).max(80),
  notes: z.string().max(4000).optional(),
  validityDays: z.number().int().positive().max(365).optional(),
  paymentTerms: z.string().max(500).optional(),
  vatMode: z.enum(["standard", "exempt"]).optional(),
  source: z.enum(["manual", "voice", "ai", "document", "template"]),
  title: z.string().max(200).optional(),
  idempotencyKey: z.string().max(120).optional(),
  questions: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
});

export type ValidateDevisResult =
  | { ok: true; draft: DevisDraft }
  | { ok: false; error: string; issues?: string[] };

/** Valide un brouillon avant persistence (serveur). */
export function validateDevisDraft(input: unknown): ValidateDevisResult {
  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues.slice(0, 6).map((i) => i.message);
    return { ok: false, error: "Devis incomplet ou invalide.", issues };
  }
  return { ok: true, draft: parsed.data as DevisDraft };
}

/** Normalise une ligne partielle (voix / UI) vers DevisLine. */
export function normalizeDevisLine(partial: {
  description?: string;
  label?: string;
  quantity?: number | null;
  qty?: number | null;
  unit?: string | null;
  unitPriceHT?: number | null;
  unitPrice?: number | null;
  vatRate?: number | null;
  missing?: string[];
  note?: string | null;
}, defaultVat = 20): DevisLine {
  const description = String(partial.description ?? partial.label ?? "").trim() || "Prestation";
  const quantity =
    typeof partial.quantity === "number" && Number.isFinite(partial.quantity) && partial.quantity > 0
      ? partial.quantity
      : typeof partial.qty === "number" && Number.isFinite(partial.qty) && partial.qty > 0
        ? partial.qty
        : 1;
  const unitPriceHT =
    typeof partial.unitPriceHT === "number" && Number.isFinite(partial.unitPriceHT) && partial.unitPriceHT >= 0
      ? partial.unitPriceHT
      : typeof partial.unitPrice === "number" && Number.isFinite(partial.unitPrice) && partial.unitPrice >= 0
        ? partial.unitPrice
        : 0;
  const vatRate =
    typeof partial.vatRate === "number" && Number.isFinite(partial.vatRate) ? partial.vatRate : defaultVat;
  const missing = Array.isArray(partial.missing) ? [...partial.missing] : [];
  if (unitPriceHT <= 0 && !missing.includes("prix")) missing.push("prix");
  return {
    description,
    quantity,
    unit: partial.unit ? String(partial.unit) : "u",
    unitPriceHT,
    vatRate,
    missing: missing.length ? missing : undefined,
    note: partial.note ?? null,
  };
}
