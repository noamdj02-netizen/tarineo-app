import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { DEFAULT_MODEL, isModelId } from "@/lib/models";
import type { ExtractResult, ExtractTotals } from "@/lib/metier/types";

function numOrNull(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseTotals(raw: unknown, lineSum: number): ExtractTotals {
  const t = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    ht: numOrNull(t.ht ?? t.total_ht) ?? (lineSum > 0 ? Math.round(lineSum * 100) / 100 : null),
    eco_contribution: numOrNull(t.eco_contribution ?? t.eco),
    pmcb: numOrNull(t.pmcb),
    weight_kg: numOrNull(t.weight_kg ?? t.poids),
  };
}

function model() {
  const env = process.env.ANTHROPIC_MODEL;
  return isModelId(env) ? env : DEFAULT_MODEL;
}

function fallbackExtract(fileName: string): ExtractResult {
  const n = fileName.toLowerCase();
  const isFacture = n.includes("facture");
  const isBc = n.includes("commande") || n.includes("bc");
  const isClient = n.includes("client") || n.includes("dupont");
  return {
    direction: isClient ? "out" : "in",
    kind: isFacture ? "facture" : isBc ? "bon_commande" : "devis",
    title: fileName.replace(/\.[a-z0-9]+$/i, "") || "Document",
    party_name: isClient ? "Madame Dupont" : "Cedeo Lyon",
    party_kind: isClient ? "client" : "distributeur",
    chantier_hint: "Madame Dupont",
    lines: [
      { label: "Tube PVC Ø 500", qty: 18, unit: "ml", buy_price: 24.6, pmcb: 0.42, weight_kg: 86.4 },
    ],
    totals: {
      ht: 442.8,
      eco_contribution: 0.42,
      pmcb: 0.42,
      weight_kg: 86.4,
    },
  };
}

export async function extractDocument(input: {
  fileName: string;
  mime: string;
  base64: string;
}): Promise<ExtractResult> {
  if (!process.env.ANTHROPIC_API_KEY) return fallbackExtract(input.fileName);

  const media = input.mime.startsWith("image/")
    ? ({ type: "image", source: { type: "base64", media_type: input.mime as "image/jpeg" | "image/png" | "image/gif" | "image/webp", data: input.base64 } } as const)
    : input.mime === "application/pdf"
      ? ({ type: "document", source: { type: "base64", media_type: "application/pdf", data: input.base64 } } as const)
      : null;

  try {
    const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [
      {
        type: "text",
        text: `Lis ce document d'artisan (devis, facture, bon de commande). Réponds UNIQUEMENT en JSON:
{"direction":"in"|"out","kind":"devis"|"facture"|"bon_commande"|"bl"|"autre","title":"...","party_name":"...","party_kind":"client"|"fournisseur"|"distributeur","chantier_hint":"...","totals":{"ht":0,"eco_contribution":null,"pmcb":null,"weight_kg":null},"lines":[{"label":"...","qty":1,"unit":"u","buy_price":0,"eco_contribution":null,"pmcb":null,"weight_kg":null}]}
Règles :
- direction=in si achat chez un distributeur/fournisseur, out si destiné au client de l'artisan.
- totals.ht = total hors taxe du document (pas le TTC). Si seul le TTC est écrit, calcule le HT si la TVA est claire, sinon null.
- totals.eco_contribution = éco-contribution / REP si une ligne ou un total le dit, sinon null.
- totals.pmcb = éco-contribution filière PMCB (produits et matériaux de construction du bâtiment) si indiquée, sinon null. Ne pas inventer.
- totals.weight_kg = poids total en kilogrammes seulement s'il est écrit (kg, t : convertir en kg). Sinon null.
- Sur chaque ligne, recopie éco-contribution, PMCB et poids s'ils sont indiqués, sinon null.`,
      },
    ];
    if (media) content.push(media as never);
    const res = await new Anthropic().messages.create({
      model: model(),
        max_tokens: 2000,
      messages: [{ role: "user", content }],
    });
    const raw = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    const json = raw.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return fallbackExtract(input.fileName);
    const parsed = JSON.parse(json) as ExtractResult & { totals?: ExtractTotals };
    if (!parsed.kind || !parsed.lines) return fallbackExtract(input.fileName);
    const lines = (parsed.lines ?? []).map((l) => ({
      label: String(l.label),
      qty: Number(l.qty) || 1,
      unit: l.unit || "u",
      buy_price: Number(l.buy_price) || 0,
      eco_contribution: numOrNull(l.eco_contribution),
      pmcb: numOrNull(l.pmcb),
      weight_kg: numOrNull(l.weight_kg),
    }));
    const lineSum = lines.reduce((s, l) => s + l.buy_price * l.qty, 0);
    return {
      direction: parsed.direction === "out" ? "out" : "in",
      kind: parsed.kind,
      title: parsed.title || input.fileName,
      party_name: parsed.party_name || "Inconnu",
      party_kind: parsed.party_kind || "distributeur",
      chantier_hint: parsed.chantier_hint || "",
      totals: parseTotals(parsed.totals, lineSum),
      lines,
    };
  } catch {
    return fallbackExtract(input.fileName);
  }
}
