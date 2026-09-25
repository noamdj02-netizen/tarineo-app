import { z } from "zod";
import convertHeic from "heic-convert";
import { anthropic, isAnthropicConfigured } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin } from "@/lib/supabase";
import { comparerLignesAuHistorique, creerAlertesHausse } from "@/lib/comparaisonPrix";
import { dateMinHistoriquePlan } from "@/lib/planGating";
import { extraireEtEnregistrerLogoFournisseur } from "@/lib/logoFournisseurDocument";
import { normaliserReference, normaliserDistributeur } from "@/lib/normalisation";
import { TYPES_ACHAT_REEL } from "@/lib/documentLabels";
import { importerDocumentEntreprise, type DonneesImportEntreprise } from "@/lib/importDocumentEntreprise";
import { nomRessembleANonNegoce } from "@/lib/heuristiqueNonNegoce";
import { revaliderTableauDeBordApresClassification } from "@/lib/pipelineImportArtisan";
import { verifierRateLimitAnalyse } from "@/lib/rateLimitIA";
import type { DocumentType } from "@prisma/client";

const MODELE = "claude-sonnet-5";
export const SEUIL_CONFIANCE = 0.7;

const TYPE_EXTRAIT_VERS_ENUM: Record<string, DocumentType> = {
  devis: "DEVIS",
  facture: "FACTURE",
  bon_commande: "BON_COMMANDE",
  bon_enlevement: "BON_ENLEVEMENT",
};

const ligneSchema = z.object({
  reference: z.string(),
  reference_normalisee: z.string(),
  reference_fabricant: z.string().nullable(),
  designation: z.string(),
  quantite: z.number(),
  prix_unitaire_ht: z.number(),
  remise_pct: z.number(),
  total_ligne_ht: z.number(),
  taux_tva: z.number().optional(),
});

const logoZoneSchema = z
  .object({
    x_pct: z.number(),
    y_pct: z.number(),
    width_pct: z.number(),
    height_pct: z.number(),
    confiance: z.number(),
  })
  .nullable();

const extractionSchema = z.object({
  domaine: z.preprocess(
    (v) => (v === "entreprise" ? "entreprise" : "distributeur"),
    z.enum(["distributeur", "entreprise"]),
  ),
  distributeur: z.string(),
  client_nom: z.preprocess((v) => (typeof v === "string" ? v : null), z.string().nullable()),
  client_adresse: z.preprocess((v) => (typeof v === "string" ? v : null), z.string().nullable()),
  date_document: z.string().nullable(),
  type: z.enum(["devis", "facture", "bon_commande", "bon_enlevement"]),
  type_entreprise: z.preprocess(
    (v) => (typeof v === "string" ? v : null),
    z.enum(["devis_client", "facture_client", "commande_client"]).nullable(),
  ),
  numero: z.string().nullable(),
  lignes: z.array(ligneSchema),
  total_ht: z.number(),
  tva: z.number(),
  total_ttc: z.number(),
  confiance: z.number(),
  emetteur_est_negoce_materiaux: z.preprocess(
    (v) => v !== false,
    z.boolean(),
  ),
  logo_zone: logoZoneSchema,
});

// Doit rester en phase avec extractionSchema ci-dessus. Sous-ensemble JSON Schema
// accepté par l'API (pas de minLength/minimum, additionalProperties: false partout).
const JSON_SCHEMA = {
  type: "object",
  properties: {
    domaine: { type: "string", enum: ["distributeur", "entreprise"] },
    distributeur: { type: "string" },
    client_nom: { type: ["string", "null"] },
    client_adresse: { type: ["string", "null"] },
    date_document: { type: ["string", "null"] },
    type: { type: "string", enum: ["devis", "facture", "bon_commande", "bon_enlevement"] },
    type_entreprise: { type: ["string", "null"] },
    numero: { type: ["string", "null"] },
    lignes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          reference: { type: "string" },
          reference_normalisee: { type: "string" },
          reference_fabricant: { type: ["string", "null"] },
          designation: { type: "string" },
          quantite: { type: "number" },
          prix_unitaire_ht: { type: "number" },
          remise_pct: { type: "number" },
          total_ligne_ht: { type: "number" },
          taux_tva: { type: "number" },
        },
        required: [
          "reference",
          "reference_normalisee",
          "reference_fabricant",
          "designation",
          "quantite",
          "prix_unitaire_ht",
          "remise_pct",
          "total_ligne_ht",
          "taux_tva",
        ],
        additionalProperties: false,
      },
    },
    total_ht: { type: "number" },
    tva: { type: "number" },
    total_ttc: { type: "number" },
    confiance: { type: "number" },
    emetteur_est_negoce_materiaux: { type: "boolean" },
    logo_zone: {
      type: ["object", "null"],
      properties: {
        x_pct: { type: "number" },
        y_pct: { type: "number" },
        width_pct: { type: "number" },
        height_pct: { type: "number" },
        confiance: { type: "number" },
      },
      required: ["x_pct", "y_pct", "width_pct", "height_pct", "confiance"],
      additionalProperties: false,
    },
  },
  required: [
    "domaine",
    "distributeur",
    "client_nom",
    "client_adresse",
    "date_document",
    "type",
    "type_entreprise",
    "numero",
    "lignes",
    "total_ht",
    "tva",
    "total_ttc",
    "confiance",
    "emetteur_est_negoce_materiaux",
    "logo_zone",
  ],
  additionalProperties: false,
} as const;

const PROMPT = `Tu analyses un document commercial scanné par un artisan du bâtiment.

ÉTAPE 1 — domaine (obligatoire) :
- "distributeur" (CAS PRINCIPAL) : document ÉMIS PAR un négoce / distributeur de matériaux À L'ARTISAN
  (devis fournisseur, facture d'achat, bon de commande, bon d'enlèvement — Cedeo, Point P, Rexel…).
  Tu DOIS renseigner distributeur (enseigne émettrice) et le type exact (devis, facture, bon_commande,
  bon_enlevement). client_nom et type_entreprise = null.
- "entreprise" : seulement si le document est ÉMIS PAR L'ARTISAN vers un client final (devis/facture client),
  pas un achat chez un distributeur.

ÉTAPE 2 — si domaine = "distributeur" :
Le type (devis / facture / bon_commande / bon_enlevement) détermine la section de classement dans l'app.
Bon d'enlèvement = document remis en agence ("Bon d'enlèvement", "Retrait marchandise").

ÉTAPE 3 — si domaine = "entreprise" :
type_entreprise : devis_client | facture_client | commande_client (commande client = bon de commande
ou engagement client avant facture). client_nom = le client destinataire. distributeur = "".
type peut rester "devis" si ambigu. Lignes = prestations/matériel facturés au client (pas codes négoce).

Enseignes distributeur fréquentes (exemples, liste non limitative) : Cedeo, Envie de Salle de Bain, Point P,
La Plateforme du Bâtiment, Dispart, PUM, Dispano, Rexel, Sonepar, France Bonhomme, France Air,
Castorama, Brico Dépôt, Screwfix, Leroy Merlin, Tecnomat (ex-Bricoman), Aubade, Tereva,
Bleu Rouge, Gedimat, BigMat, Bois & Matériaux, Brossette, Richardson.
Cette liste n'est PAS limitative : si le document provient d'un autre négoce régional de
matériaux, relève le nom tel qu'il apparaît. Ne confonds JAMAIS un client, un chantier, une
société d'agencement/travaux (ex. "F Agencement", "EcoBat" comme client) ou un autre artisan
avec un distributeur : dans ce cas emetteur_est_negoce_materiaux = false et domaine = "entreprise".

- emetteur_est_negoce_materiaux : true UNIQUEMENT si l'émetteur est un point de vente / grossiste
  de matériaux ou fournitures pro du bâtiment (négoce). false pour client, agencement, bureau d'études,
  sous-traitant, nom de particulier, ou document que TU as classé côté "entreprise".

- distributeur : le nom commercial de l'enseigne émettrice tel qu'imprimé sur le document
  (en-tête, logo, pied de page avec le SIRET). S'il s'agit d'une agence locale
  ("POINT P SAINT-PRIEST"), retiens l'enseigne sans la ville ("Point P").

Extrais les informations dans le JSON demandé :
- type (distributeur uniquement) : détermine le VRAI type à partir du contenu ("Devis n°",
  "Facture n°", "Bon de commande n°", "Bon d'enlèvement n°"...), sans te fier à une indication externe erronée.
- taux_tva : pourcentage TVA par ligne (20 ou 10 typiquement côté client ; 0 si inconnu côté distributeur).
- reference_normalisee : la référence produit en majuscules, sans espaces ni accents
- reference_fabricant : la référence FABRICANT du produit si elle est identifiable, à distinguer
  du code interne du distributeur (souvent une colonne "Code" ou "Référence" dédiée, purement
  numérique ou propre à l'enseigne). La référence fabricant est en général noyée dans le texte de
  la désignation, précédée d'une mention comme "Réf.", "Ref", "Modèle" (ex : dans "Porte pliante
  SMART EXPRESS 90cm blanc TN Réf. PA1951BTNE", la référence fabricant est "PA1951BTNE"). Ne la
  confonds jamais avec le code interne. Si tu ne peux pas l'identifier avec certitude, mets null
  plutôt que d'inventer ou de recopier le code interne.
- confiance : ton niveau de confiance global dans l'extraction, entre 0 et 1. Baisse-la aussi si
  le type de document est ambigu ou difficile à déterminer.
- date_document au format AAAA-MM-JJ
- logo_zone : emplacement du logo de l'enseigne émettrice sur la première page, en pourcentages
  de la page (x_pct et y_pct = coin supérieur gauche du rectangle ; width_pct et height_pct =
  largeur et hauteur). Cadre uniquement le logo/marque visible, pas tout l'en-tête ni le texte
  juridique. confiance entre 0 et 1 sur la localisation du logo. null si aucun logo identifiable.

Si une information est illisible ou absente, mets une valeur vide ("" ou 0) plutôt que d'inventer,
et baisse la confiance en conséquence.`;

async function construireBlocContenu(buffer: Buffer, extension: string | undefined) {
  if (extension === "pdf") {
    return {
      type: "document" as const,
      source: {
        type: "base64" as const,
        media_type: "application/pdf" as const,
        data: buffer.toString("base64"),
      },
    };
  }

  let imageBuffer = buffer;
  let mediaType: "image/jpeg" | "image/png" = extension === "png" ? "image/png" : "image/jpeg";

  if (extension === "heic") {
    // L'API vision de Claude n'accepte pas le HEIC : conversion à la volée,
    // le fichier original reste stocké tel quel dans Supabase Storage.
    const converti = await convertHeic({ buffer, format: "JPEG", quality: 0.9 });
    imageBuffer = Buffer.from(converti);
    mediaType = "image/jpeg";
  }

  return {
    type: "image" as const,
    source: { type: "base64" as const, media_type: mediaType, data: imageBuffer.toString("base64") },
  };
}

export async function analyserDocument(documentId: string, userId: string): Promise<boolean> {
  const document = await prisma.document.findFirst({ where: { id: documentId, userId } });
  if (!document) return false;

  if (!verifierRateLimitAnalyse(userId)) {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "ERROR" },
    });
    return false;
  }

  try {
    if (!isAnthropicConfigured()) {
      throw new Error("ANTHROPIC_API_KEY manquante — renseignez-la dans le fichier .env puis relancez l'analyse.");
    }

    const { data, error } = await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).download(document.fileKey);
    if (error || !data) {
      throw new Error("Téléchargement du fichier depuis Supabase Storage impossible : " + error?.message);
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    const extension = document.fileKey.split(".").pop()?.toLowerCase();
    const blocContenu = await construireBlocContenu(buffer, extension);

    const response = await anthropic.messages.create({
      model: MODELE,
      max_tokens: 4096,
      output_config: { format: { type: "json_schema", schema: JSON_SCHEMA } },
      messages: [
        {
          role: "user",
          content: [blocContenu, { type: "text", text: PROMPT }],
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      throw new Error("Extraction refusée par Claude");
    }

    const blocTexte = response.content.find((bloc) => bloc.type === "text");
    if (!blocTexte || blocTexte.type !== "text") {
      throw new Error("Réponse Claude sans contenu texte exploitable");
    }

    const extraction = extractionSchema.parse(JSON.parse(blocTexte.text));

    if (extraction.domaine === "entreprise") {
      return await analyserDocumentEntreprise(documentId, userId, extraction);
    }

    const emetteurNegoce =
      extraction.emetteur_est_negoce_materiaux &&
      !nomRessembleANonNegoce(extraction.distributeur);

    if (!emetteurNegoce) {
      return await analyserDocumentEntreprise(documentId, userId, {
        ...extraction,
        domaine: "entreprise",
        client_nom: extraction.client_nom ?? extraction.distributeur,
        type_entreprise:
          extraction.type_entreprise ??
          (extraction.type === "facture" ? "facture_client" : "devis_client"),
        emetteur_est_negoce_materiaux: false,
      });
    }

    // Un total absent ou nul ne doit jamais partir en auto-validé, même avec une
    // confiance élevée : Claude peut être très sûr de tout le reste du document et
    // avoir simplement échoué à lire le total (voir l'audit de fiabilité /depenses).
    const totalManquant = !extraction.total_ht || extraction.total_ht <= 0;

    // Repli sur empreinte (distributeur + date + montant) pour repérer un même achat
    // re-scanné sous un fichier différent — le hash de fichier (vérifié à l'upload,
    // voir src/lib/documents.ts) ne couvre que l'octet-pour-octet identique.
    let possibleDoublon = false;
    if (extraction.distributeur && extraction.date_document && !totalManquant) {
      const distributorNorm = normaliserDistributeur(extraction.distributeur);
      const documentDate = new Date(extraction.date_document);
      const autreDocument = await prisma.document.findFirst({
        where: {
          userId,
          id: { not: documentId },
          distributorNorm,
          documentDate,
          totalHt: extraction.total_ht,
        },
        select: { id: true },
      });
      possibleDoublon = autreDocument !== null;
    }

    const statut =
      extraction.confiance >= SEUIL_CONFIANCE && !totalManquant && !possibleDoublon ? "VALIDATED" : "NEEDS_REVIEW";

    const distributorNorm = extraction.distributeur ? normaliserDistributeur(extraction.distributeur) : null;
    const typeDocument = TYPE_EXTRAIT_VERS_ENUM[extraction.type] ?? document.type;
    const estAchatReel = TYPES_ACHAT_REEL.includes(typeDocument);

    await prisma.document.update({
      where: { id: documentId },
      data: {
        // Le type détecté par l'IA à partir du contenu prime sur le choix initial de
        // l'artisan (simple pré-sélection avant analyse, faite sans avoir lu le document).
        type: typeDocument,
        distributor: extraction.distributeur || null,
        distributorNorm,
        documentDate: extraction.date_document ? new Date(extraction.date_document) : null,
        totalHt: extraction.total_ht,
        totalTtc: extraction.total_ttc,
        rawExtraction: extraction,
        status: statut,
        possibleDoublon,
      },
    });

    if (extraction.distributeur && distributorNorm) {
      try {
        await extraireEtEnregistrerLogoFournisseur({
          userId,
          distributor: extraction.distributeur,
          distributorNorm,
          fileBuffer: buffer,
          extension: extension ?? "jpg",
          logoZone: extraction.logo_zone,
        });
      } catch (erreurLogo) {
        console.warn("Logo fournisseur non extrait pour le document", documentId, ":", erreurLogo);
      }
    }

    const lignesAvecRef = extraction.lignes.map((ligne) => ({
      ...ligne,
      referenceNorm: ligne.reference_normalisee?.trim() || normaliserReference(ligne.reference),
      manufacturerRefNorm: ligne.reference_fabricant?.trim()
        ? normaliserReference(ligne.reference_fabricant)
        : null,
    }));

    for (const ligne of lignesAvecRef) {
      await prisma.lineItem.create({
        data: {
          documentId,
          userId,
          reference: ligne.reference,
          referenceNorm: ligne.referenceNorm,
          manufacturerRef: ligne.reference_fabricant?.trim() || null,
          manufacturerRefNorm: ligne.manufacturerRefNorm,
          designation: ligne.designation,
          quantity: ligne.quantite,
          unitPriceHt: ligne.prix_unitaire_ht,
          discountPct: ligne.remise_pct,
          totalHt: ligne.total_ligne_ht,
        },
      });
    }

    if (statut === "VALIDATED" && extraction.distributeur && extraction.date_document) {
      const distributeur = extraction.distributeur;
      const documentDate = new Date(extraction.date_document);

      // Comparé à l'historique AVANT d'y insérer les prix de ce document, sinon
      // chaque ligne se comparerait à elle-même.
      const utilisateur = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true, subscriptionStatus: true },
      });
      const dateMinHistorique = dateMinHistoriquePlan(
        utilisateur?.plan ?? null,
        utilisateur?.subscriptionStatus ?? null,
        documentDate,
      );
      const comparaisons = await comparerLignesAuHistorique(prisma, {
        userId,
        distributor: distributeur,
        documentId,
        documentDate,
        dateMinHistorique,
        lignes: lignesAvecRef.map((l) => ({
          referenceNorm: l.referenceNorm,
          unitPriceHt: l.prix_unitaire_ht,
          manufacturerRefNorm: l.manufacturerRefNorm,
        })),
      });

      if (estAchatReel && document.brouillonExpireAt === null) {
        for (const ligne of lignesAvecRef) {
          await prisma.priceHistory.create({
            data: {
              userId,
              referenceNorm: ligne.referenceNorm,
              manufacturerRefNorm: ligne.manufacturerRefNorm,
              distributor: distributeur,
              distributorNorm: normaliserDistributeur(distributeur),
              unitPriceHt: ligne.prix_unitaire_ht,
              documentDate,
              documentId,
            },
          });
        }
      }

      await creerAlertesHausse(prisma, {
        userId,
        documentId,
        distributor: distributeur,
        lignes: lignesAvecRef.map((l) => ({
          reference: l.reference,
          designation: l.designation,
          referenceNorm: l.referenceNorm,
        })),
        comparaisons,
      });
    }

    revaliderTableauDeBordApresClassification("distributeur", typeDocument);
    return true;
  } catch (erreur) {
    console.error("Échec de l'analyse Claude pour le document", documentId, ":", erreur);
    await prisma.lineItem.deleteMany({ where: { documentId } });
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "ERROR" },
    });
    return false;
  }
}

async function analyserDocumentEntreprise(
  documentId: string,
  userId: string,
  extraction: z.infer<typeof extractionSchema>,
): Promise<boolean> {
  const typeEntreprise =
    extraction.type_entreprise === "facture_client"
      ? "facture_client"
      : extraction.type_entreprise === "commande_client"
        ? "commande_client"
        : "devis_client";

  const donnees: DonneesImportEntreprise = {
    typeEntreprise,
    clientNom: extraction.client_nom?.trim() || "Client à identifier",
    clientAdresse: extraction.client_adresse,
    dateDocument: extraction.date_document,
    numero: extraction.numero,
    confiance: extraction.confiance,
    totalHt: extraction.total_ht,
    totalTva: extraction.tva,
    totalTtc: extraction.total_ttc,
    lignes: extraction.lignes.map((l) => ({
      designation: l.designation || l.reference || "Ligne",
      quantite: l.quantite,
      prix_unitaire_ht: l.prix_unitaire_ht,
      taux_tva: l.taux_tva ?? 20,
      total_ligne_ht: l.total_ligne_ht,
    })),
  };

  const importResult = await importerDocumentEntreprise(userId, donnees);
  const confianceBasse = extraction.confiance < SEUIL_CONFIANCE;

  const rawEnrichi = {
    ...extraction,
    domaine: "entreprise" as const,
    type_entreprise: typeEntreprise,
    cibleEntreprise: importResult.ok ? importResult.cible : null,
    importEntreprise: importResult.ok ? "ok" : importResult.raison,
  };

  await prisma.document.update({
    where: { id: documentId },
    data: {
      type: "DEVIS",
      distributor: null,
      distributorNorm: null,
      documentDate: extraction.date_document ? new Date(extraction.date_document) : null,
      totalHt: extraction.total_ht,
      totalTtc: extraction.total_ttc,
      rawExtraction: rawEnrichi,
      status:
        importResult.ok && !confianceBasse ? "NEEDS_REVIEW" : "NEEDS_REVIEW",
      possibleDoublon: false,
    },
  });

  revaliderTableauDeBordApresClassification("entreprise");
  return importResult.ok;
}
