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

export const EXTRACT_PROMPT_BASE = `Tu es expert en lecture de documents BTP français (devis, factures, bons de commande, bons de livraison, bons d’enlèvement).

Lis UNIQUEMENT ce qui est écrit. N’invente rien.

Réponds UNIQUEMENT en JSON valide :
{
  "direction":"in"|"out",
  "kind":"devis"|"facture"|"bon_commande"|"bl"|"bon_enlevement"|"autre",
  "title":"titre court avec n° si présent",
  "document_number":"n° document ou chaîne vide",
  "issue_date":"AAAA-MM-JJ ou chaîne vide",
  "party_name":"nom client OU fournisseur/distributeur",
  "party_kind":"client"|"fournisseur"|"distributeur",
  "party_address":"adresse telle qu’écrite ou chaîne vide",
  "chantier_hint":"nom/adresse chantier ou chaîne vide",
  "totals":{"ht":0|"null","ttc":null,"tva":null,"eco_contribution":null,"pmcb":null,"weight_kg":null},
  "lines":[{
    "label":"désignation exacte",
    "qty":1,
    "unit":"u|m²|ml|m³|h|ens|forfait|kg",
    "unit_price_ht":0,
    "buy_price":0,
    "sell_price":0,
    "tva_rate":20,
    "eco_contribution":null,
    "pmcb":null,
    "weight_kg":null
  }],
  "read_assessment":{
    "summary":"2 à 4 phrases en français : type de document, émetteur, nb de lignes, total HT si lisible, chantier si écrit. Uniquement ce qui est visible.",
    "quality":"fiable"|"partiel"|"incertain",
    "caveats":["éléments flous, illisibles ou ambigus — max 4 entrées courtes, tableau vide si tout est net"]
  }
}

Règles métier :
1. direction=in si c’est un achat chez distributeur/fournisseur (Point P, Descours, etc.). direction=out si le document est émis PAR l’artisan VERS son client.
2. kind : déduis du libellé (DEVIS, FACTURE, BON DE COMMANDE, BL, BON D’ENLÈVEMENT). Si ambigu → autre.
3. title : conserve le type + n° (ex. « Devis n° D-2024-12 »). Si pas de n°, utilise un titre fidèle au document.
4. totals.ht = total HT global. Si seul TTC + taux TVA sont clairs, calcule HT. Sinon null. Ne confonds pas HT et TTC.
5. Sur chaque ligne :
   - unit_price_ht = prix unitaire HT tel qu’écrit
   - buy_price = unit_price_ht si direction=in, sinon 0
   - sell_price = unit_price_ht si direction=out, sinon 0
   - qty / unit / tva_rate tels qu’écrits (défaut qty=1, unit=u, tva=20 si non indiqué mais régime normal visible)
6. Recopie éco-contribution, PMCB, poids seulement s’ils sont explicitement indiqués.
7. chantier_hint = adresse de livraison / chantier / référence chantier écrite.
8. Maximum 60 lignes. Ignore les lignes purement marketing / conditions générales.
9. N’invente AUCUNE ligne, AUCUN montant, AUCUN fournisseur.
10. read_assessment : auto-évalue la lisibilité (fiable = scan net, partiel = zones floues, incertain = gros doutes). caveats = incertitudes réelles, pas de remplissage.`;

function buildExtractPrompt(promptAddon?: string): string {
  const addon = promptAddon?.trim();
  if (!addon) return EXTRACT_PROMPT_BASE;
  return `${EXTRACT_PROMPT_BASE}

Profil de mise en page (enseigne / structure communautaire — indices uniquement, ne pas inventer de données) :
${addon}`;
}

export async function extractDocument(input: {
  fileName: string;
  mime: string;
  base64: string;
  promptAddon?: string;
}): Promise<ExtractResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ExtractError("Extraction impossible : service d’analyse non configuré.");
  }

  const media = input.mime.startsWith("image/")
    ? ({
        type: "image",
        source: {
          type: "base64",
          media_type: input.mime as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: input.base64,
        },
      } as const)
    : input.mime === "application/pdf"
      ? ({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: input.base64 },
        } as const)
      : null;

  if (!media) {
    throw new ExtractError("Joignez un PDF ou une image (JPEG, PNG, WebP, GIF).");
  }

  try {
    const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [
      { type: "text", text: buildExtractPrompt(input.promptAddon) },
      media as never,
    ];
    const res = await new Anthropic().messages.create({
      model: model(),
      max_tokens: 4500,
      messages: [{ role: "user", content }],
    });
    const raw = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    return parseExtractResponse(raw, input.fileName);
  } catch (err) {
    if (err instanceof ExtractError) throw err;
    throw new ExtractError("Extraction impossible. Réessayez ou saisissez le document à la main.");
  }
}
