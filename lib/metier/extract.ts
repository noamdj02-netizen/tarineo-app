import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { DEFAULT_MODEL, isModelId } from "@/lib/models";
import { ExtractError, parseExtractResponse } from "@/lib/metier/extract-parse";
import type { ExtractResult } from "@/lib/metier/types";

export { ExtractError, parseExtractResponse };

function model() {
  const env = process.env.ANTHROPIC_MODEL;
  return isModelId(env) ? env : DEFAULT_MODEL;
}

export async function extractDocument(input: {
  fileName: string;
  mime: string;
  base64: string;
}): Promise<ExtractResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ExtractError("Extraction impossible : service d’analyse non configuré.");
  }

  const media = input.mime.startsWith("image/")
    ? ({ type: "image", source: { type: "base64", media_type: input.mime as "image/jpeg" | "image/png" | "image/gif" | "image/webp", data: input.base64 } } as const)
    : input.mime === "application/pdf"
      ? ({ type: "document", source: { type: "base64", media_type: "application/pdf", data: input.base64 } } as const)
      : null;

  if (!media) {
    throw new ExtractError("Joignez un PDF ou une image (JPEG, PNG, WebP, GIF).");
  }

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
- Sur chaque ligne, recopie éco-contribution, PMCB et poids s'ils sont indiqués, sinon null.
- chantier_hint = nom de chantier, adresse de livraison ou référence de site telle qu’écrite (ex. « Villa Martin — Lyon 3 »). Recopie fidèlement. Chaîne vide si le document n’en contient pas.
- N’invente aucune ligne, aucun fournisseur, aucun montant, aucun chantier.`,
      },
    ];
    content.push(media as never);
    const res = await new Anthropic().messages.create({
      model: model(),
      max_tokens: 2000,
      messages: [{ role: "user", content }],
    });
    const raw = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    return parseExtractResponse(raw, input.fileName);
  } catch (err) {
    if (err instanceof ExtractError) throw err;
    throw new ExtractError("Extraction impossible. Réessayez ou saisissez le document à la main.");
  }
}
