"use server";

import Anthropic from "@anthropic-ai/sdk";
import { DEFAULT_MODEL, isModelId } from "@/lib/models";
import { getDb } from "@/lib/db";

export type DevisProposalLine = {
  label: string;
  qty: number | null;
  unit: string | null;
  unitPrice: number | null;
  note: string | null;
  missing: string[];
};

export type DevisProposal = {
  summary: string;
  lines: DevisProposalLine[];
  questions: string[];
  warnings: string[];
};

function model() {
  const env = process.env.ANTHROPIC_MODEL;
  return isModelId(env) ? env : DEFAULT_MODEL;
}

/**
 * Structure une description de chantier en proposition de devis.
 * N’invente jamais de prix : unitPrice reste null si non dit explicitement.
 */
export async function structureDevisFromSpeech(input: {
  transcript: string;
  chantierName?: string | null;
  chantierAddress?: string | null;
}): Promise<{ ok: true; proposal: DevisProposal } | { ok: false; error: string }> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Connexion requise." };

  const text = input.transcript.trim();
  if (text.length < 8) {
    return { ok: false, error: "Description trop courte. Décrivez le chantier un peu plus." };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: "Analyse IA indisponible pour le moment." };
  }

  const context = [
    input.chantierName ? `Chantier : ${input.chantierName}` : null,
    input.chantierAddress ? `Adresse : ${input.chantierAddress}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await new Anthropic().messages.create({
      model: model(),
      max_tokens: 1200,
      messages: [
        {
          role: "user",
          content: `Tu es l’Assistant BTP TARINEO. Transforme la description orale d’un artisan en proposition de devis STRUCTURÉE.

Contexte chantier (déjà connu, ne pas redemander) :
${context || "(aucun chantier sélectionné)"}

Description :
"""
${text}
"""

Réponds UNIQUEMENT en JSON :
{
  "summary": "une phrase",
  "lines": [
    {
      "label": "intitulé prestation",
      "qty": number|null,
      "unit": "m²"|"ml"|"u"|"h"|null,
      "unitPrice": null,
      "note": null,
      "missing": ["prix"|"quantité"|"unité"|"matériau"|"main-d'œuvre"]
    }
  ],
  "questions": ["questions précises à confirmer"],
  "warnings": ["avertissements courts"]
}

Règles STRICTES :
- Vocabulaire bâtiment (plomberie, électricité, carrelage, peinture, maçonnerie, etc.).
- N’invente AUCUN prix : unitPrice doit toujours être null sauf si un prix est EXPLICITEMENT dit dans la description.
- Si quantité / unité / matériau manquent → mets-les dans missing et questions.
- Ne crée pas de lignes qui ne sont pas dans la description.
- Maximum 12 lignes.`,
        },
      ],
    });

    const raw = res.content.find((b) => b.type === "text")?.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { ok: false, error: "Réponse IA illisible. Réessayez." };
    const parsed = JSON.parse(jsonMatch[0]) as DevisProposal;
    if (!Array.isArray(parsed.lines) || parsed.lines.length === 0) {
      return { ok: false, error: "Aucune prestation identifiée. Reformulez la description." };
    }

    const proposal: DevisProposal = {
      summary: String(parsed.summary ?? "").trim() || "Proposition de devis",
      lines: parsed.lines.slice(0, 12).map((l) => ({
        label: String(l.label ?? "").trim() || "Prestation",
        qty: typeof l.qty === "number" && Number.isFinite(l.qty) ? l.qty : null,
        unit: l.unit ? String(l.unit) : null,
        // Force null prices unless explicitly numeric AND we trust them — still null by policy unless said
        unitPrice: null,
        note: l.note ? String(l.note) : null,
        missing: Array.isArray(l.missing) ? l.missing.map(String) : ["prix"],
      })),
      questions: Array.isArray(parsed.questions) ? parsed.questions.map(String).slice(0, 6) : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String).slice(0, 6) : [],
    };

    return { ok: true, proposal };
  } catch (err) {
    console.error("[structureDevisFromSpeech]", err);
    return { ok: false, error: "Structuration impossible. Réessayez dans un moment." };
  }
}
