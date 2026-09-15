// Pipeline IA "prompt texte → lignes de devis structurées" (étape 2 du chantier
// "devis clients assistés par IA" — voir le plan). Même pattern de sortie structurée
// que src/lib/extraction.ts (output_config json_schema + zod), mais indépendant : ce
// module ne touche jamais à Document/LineItem (devis fournisseurs), seulement aux
// lignes en mémoire qui alimentent ensuite ClientQuote/ClientQuoteLine.
//
// Le PDF final reste un template fixe (src/lib/devisPdf.tsx) : l'IA ne produit jamais
// de mise en page, seulement des données que l'artisan peut corriger avant validation.
import { z } from "zod";
import { anthropic } from "@/lib/anthropic";
import type { RegimeTva } from "@prisma/client";

const MODELE = "claude-sonnet-5";

const ligneSchema = z.object({
  designation: z.string(),
  quantite: z.number(),
  prix_unitaire_ht: z.number(),
  taux_tva: z.number(),
});

const extractionSchema = z.object({
  // Nom du client si identifiable dans le texte (ex. "chez M. Dupont") — null sinon,
  // à compléter manuellement par l'artisan dans ce cas.
  client_nom: z.string().nullable(),
  lignes: z.array(ligneSchema),
});

const JSON_SCHEMA = {
  type: "object",
  properties: {
    client_nom: { type: ["string", "null"] },
    lignes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          designation: { type: "string" },
          quantite: { type: "number" },
          prix_unitaire_ht: { type: "number" },
          taux_tva: { type: "number" },
        },
        required: ["designation", "quantite", "prix_unitaire_ht", "taux_tva"],
        additionalProperties: false,
      },
    },
  },
  required: ["client_nom", "lignes"],
  additionalProperties: false,
} as const;

function construirePrompt(regimeTva: RegimeTva): string {
  return `Tu aides un artisan du bâtiment (plombier, électricien, chauffagiste...) à
transformer une description libre — tapée ou dictée à voix haute, donc pouvant contenir
des hésitations, répétitions ou reformulations à ignorer — en lignes de devis structurées
pour un de SES clients (pas un fournisseur).

Extrais :
- client_nom : le nom du client si mentionné (ex. "chez M. Dupont", "pour Mme Martin"),
  sinon null. Ne l'invente jamais.
- lignes : une ligne par prestation ou fourniture distincte mentionnée, avec :
  - designation : libellé clair et concis de la prestation/fourniture
  - quantite : nombre (1 si non précisé et qu'il s'agit d'une prestation unique)
  - prix_unitaire_ht : le montant HT mentionné pour cette ligne. Si un taux horaire de
    main d'œuvre et un nombre d'heures sont donnés séparément (ex. "main d'œuvre 2h à
    45€/h"), une seule ligne avec quantite=2 et prix_unitaire_ht=45.
  - taux_tva : ${
    regimeTva === "FRANCHISE_293B"
      ? "toujours 0 (l'artisan est en franchise en base de TVA, non assujetti)."
      : "le taux mentionné explicitement, sinon 20 par défaut (taux normal) — sauf indice clair de travaux de rénovation d'un logement de plus de 2 ans (10%) ou de travaux d'amélioration énergétique (5.5%), mentionnés par l'artisan lui-même."
  }

Ne déduis et n'ajoute aucune ligne, remise ou prestation qui ne serait pas explicitement
mentionnée dans le texte. En cas de montant ou quantité ambigu, fais l'estimation la plus
raisonnable — l'artisan pourra corriger chaque ligne avant validation.`;
}

export interface LigneDevisGeneree {
  designation: string;
  quantite: number;
  prixUnitaireHt: number;
  tauxTva: number;
}

export interface ResultatGenerationDevisIA {
  clientNom: string | null;
  lignes: LigneDevisGeneree[];
}

async function appellerClaudeEtExtraire(promptUtilisateur: string, regimeTva: RegimeTva): Promise<ResultatGenerationDevisIA> {
  const response = await anthropic.messages.create({
    model: MODELE,
    max_tokens: 2048,
    output_config: { format: { type: "json_schema", schema: JSON_SCHEMA } },
    messages: [{ role: "user", content: [{ type: "text", text: promptUtilisateur }] }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Génération refusée par Claude");
  }

  const blocTexte = response.content.find((bloc) => bloc.type === "text");
  if (!blocTexte || blocTexte.type !== "text") {
    throw new Error("Réponse Claude sans contenu texte exploitable");
  }

  const extraction = extractionSchema.parse(JSON.parse(blocTexte.text));

  // Garde-fou légal : le taux de TVA ne doit jamais dépendre de ce que l'IA a produit
  // quand la franchise en base s'applique — même si le prompt le précise déjà côté
  // instructions, on force ici plutôt que de faire confiance au modèle sur un point
  // réglementaire (voir la même logique de template fixe dans devisPdf.tsx).
  const lignes = extraction.lignes.map((l) => ({
    designation: l.designation,
    quantite: l.quantite,
    prixUnitaireHt: l.prix_unitaire_ht,
    tauxTva: regimeTva === "FRANCHISE_293B" ? 0 : l.taux_tva,
  }));

  return { clientNom: extraction.client_nom, lignes };
}

export async function genererLignesDevisDepuisPrompt(
  texte: string,
  regimeTva: RegimeTva
): Promise<ResultatGenerationDevisIA> {
  const promptUtilisateur = `${construirePrompt(regimeTva)}\n\nTexte de l'artisan :\n"""\n${texte}\n"""`;
  return appellerClaudeEtExtraire(promptUtilisateur, regimeTva);
}

function construirePromptModification(regimeTva: RegimeTva): string {
  return `Tu aides un artisan du bâtiment à corriger un devis déjà existant, destiné à un de
SES clients (pas un fournisseur), à partir d'une instruction de modification tapée ou dictée
à voix haute (donc pouvant contenir des hésitations, répétitions ou reformulations à ignorer).

On te donne les lignes actuelles du devis (au format JSON) et l'instruction de modification
de l'artisan. Ta tâche :
- Applique UNIQUEMENT ce que l'instruction demande (ajouter, retirer, remplacer ou modifier
  une ou plusieurs lignes précises — ex. "ajoute 2 heures de main d'œuvre en plus",
  "remplace le radiateur par un modèle à 200€", "enlève la ligne peinture").
- Conserve à l'identique (designation, quantite, prix_unitaire_ht, taux_tva) toutes les
  lignes non concernées par l'instruction.
- N'invente et ne déduis aucune ligne, remise ou prestation supplémentaire non demandée.
- client_nom : ne renvoie une valeur que si l'instruction demande explicitement de changer
  le client (ex. "c'est pour Mme Martin en fait") — sinon renvoie toujours null (le nom du
  client actuel ne doit jamais être modifié implicitement).
- taux_tva : ${
    regimeTva === "FRANCHISE_293B"
      ? "toujours 0 (l'artisan est en franchise en base de TVA, non assujetti)."
      : "conserve le taux existant pour les lignes inchangées ; pour une ligne nouvelle ou modifiée, utilise le taux mentionné explicitement, sinon 20 par défaut (taux normal) — sauf indice clair de travaux de rénovation d'un logement de plus de 2 ans (10%) ou de travaux d'amélioration énergétique (5.5%)."
  }

Renvoie l'intégralité des lignes du devis après application de la modification (pas
seulement les lignes changées).`;
}

export async function genererLignesDevisModifiees(
  lignesActuelles: LigneDevisGeneree[],
  instruction: string,
  regimeTva: RegimeTva
): Promise<ResultatGenerationDevisIA> {
  const lignesJson = JSON.stringify(
    lignesActuelles.map((l) => ({
      designation: l.designation,
      quantite: l.quantite,
      prix_unitaire_ht: l.prixUnitaireHt,
      taux_tva: l.tauxTva,
    }))
  );
  const promptUtilisateur = `${construirePromptModification(regimeTva)}\n\nLignes actuelles du devis :\n${lignesJson}\n\nInstruction de modification de l'artisan :\n"""\n${instruction}\n"""`;
  return appellerClaudeEtExtraire(promptUtilisateur, regimeTva);
}
