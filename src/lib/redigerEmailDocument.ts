import { z } from "zod";
import { anthropic, isAnthropicConfigured } from "@/lib/anthropic";
import { LABELS_TYPE } from "@/lib/documentLabels";
import type { Document, CompanyProfile } from "@prisma/client";

const MODELE = "claude-sonnet-5";

const emailSchema = z.object({
  objet: z.string(),
  corps: z.string(),
});

const JSON_SCHEMA = {
  type: "object",
  properties: {
    objet: { type: "string" },
    corps: { type: "string" },
  },
  required: ["objet", "corps"],
  additionalProperties: false,
} as const;

export type IntentionEmailDocument = "envoyer" | "renvoyer";

export async function redigerEmailDocument(params: {
  document: Pick<Document, "type" | "distributor" | "documentDate" | "totalHt" | "totalTtc">;
  entreprise: Pick<CompanyProfile, "raisonSociale" | "emailContact"> | null;
  extraction: { numero?: string | null } | null;
  intention: IntentionEmailDocument;
  destinataire?: string;
}): Promise<{ objet: string; corps: string }> {
  if (!isAnthropicConfigured()) {
    return emailParDefaut(params);
  }

  const typeLabel = LABELS_TYPE[params.document.type] ?? params.document.type;
  const date = params.document.documentDate?.toLocaleDateString("fr-FR") ?? "—";
  const total =
    params.document.totalTtc !== null
      ? `${Number(params.document.totalTtc).toFixed(2)} € TTC`
      : params.document.totalHt !== null
        ? `${Number(params.document.totalHt).toFixed(2)} € HT`
        : "montant non renseigné";

  const prompt = `Tu rédiges un email professionnel court en français pour un artisan du bâtiment.

Contexte :
- Entreprise émettrice : ${params.entreprise?.raisonSociale ?? "Mon entreprise"}
- Type de document : ${typeLabel}
- Distributeur : ${params.document.distributor ?? "non précisé"}
- Numéro : ${params.extraction?.numero ?? "non précisé"}
- Date : ${date}
- Montant : ${total}
- Intention : ${params.intention === "renvoyer" ? "renvoyer le document (relance ou second envoi)" : "premier envoi du document"}
${params.destinataire ? `- Destinataire : ${params.destinataire}` : ""}

Consignes :
- Ton sobre et direct, adapté à un échange avec un comptable, un client ou un collègue de chantier
- Mentionner le type de document et le distributeur si pertinent
- Indiquer que le fichier est en pièce jointe
- Pas de formule trop longue : 4 à 8 lignes maximum dans le corps
- Objet court et explicite (sans guillemets)
- Ne pas inventer de montants ou de références absents du contexte`;

  try {
    const response = await anthropic.messages.create({
      model: MODELE,
      max_tokens: 1024,
      output_config: { format: { type: "json_schema", schema: JSON_SCHEMA } },
      messages: [{ role: "user", content: prompt }],
    });

    const bloc = response.content.find((b) => b.type === "text");
    if (!bloc || bloc.type !== "text") {
      return emailParDefaut(params);
    }

    return emailSchema.parse(JSON.parse(bloc.text));
  } catch {
    return emailParDefaut(params);
  }
}

function emailParDefaut(params: {
  document: Pick<Document, "type" | "distributor" | "documentDate" | "totalTtc">;
  entreprise: Pick<CompanyProfile, "raisonSociale"> | null;
  extraction: { numero?: string | null } | null;
  intention: IntentionEmailDocument;
}): { objet: string; corps: string } {
  const typeLabel = LABELS_TYPE[params.document.type] ?? params.document.type;
  const distributeur = params.document.distributor ?? "fournisseur";
  const numero = params.extraction?.numero ? ` n° ${params.extraction.numero}` : "";
  const ent = params.entreprise?.raisonSociale ?? "Mon entreprise";
  const action = params.intention === "renvoyer" ? "Je vous renvoie" : "Je vous transmets";

  return {
    objet: `${typeLabel}${numero} — ${distributeur}`,
    corps: `Bonjour,\n\n${action} le ${typeLabel.toLowerCase()}${numero} de ${distributeur} en pièce jointe.\n\nBien cordialement,\n${ent}`,
  };
}
