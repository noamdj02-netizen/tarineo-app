"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { genererNumeroDevis, calculerTotauxDevis, genererEtStockerPdfDevis } from "@/lib/devisClients";
import { genererLignesDevisDepuisPrompt } from "@/lib/genererDevisIA";
import { quotaDevisIA, debutMoisUTC } from "@/lib/quota";
import { verifierRateLimitDevisIA } from "@/lib/rateLimitIA";
import { suggererPrixAchat, type SuggestionPrix } from "@/lib/suggestionPrix";

const ligneSchema = z.object({
  designation: z.string().trim().min(1, "Chaque ligne doit avoir une désignation."),
  quantite: z.number().positive("La quantité doit être supérieure à 0."),
  prixUnitaireHt: z.number().min(0, "Le prix unitaire ne peut pas être négatif."),
  tauxTva: z.number().min(0).max(100),
});

const schema = z.object({
  clientNom: z.string().trim().min(1, "Le nom du client est requis."),
  clientAdresse: z.string().trim().optional(),
  clientSiret: z.string().trim().optional(),
  clientEmail: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, "Email invalide."),
  dureeValiditeJours: z.number().int().positive(),
  conditionsPaiement: z.string().trim().min(1, "Les conditions de paiement sont requises."),
  lignes: z.array(ligneSchema).min(1, "Ajoutez au moins une ligne."),
  // Renseigné uniquement quand les lignes viennent du pipeline IA (voir
  // genererDepuisPrompt ci-dessous) — conservé pour traçabilité et compté dans le
  // quota mensuel de génération IA (voir src/lib/quota.ts). Une création 100% manuelle
  // ne consomme pas ce quota.
  promptOriginal: z.string().trim().optional(),
});

export type DonneesNouveauDevis = z.input<typeof schema>;
export type ResultatCreationDevis = { succes: true; id: string } | { succes: false; erreur: string };

// Création d'un devis client (finalise aussi bien la saisie 100% manuelle que la
// correction d'un aperçu généré par IA, voir genererDepuisPrompt) : valide, calcule les
// totaux, numérote, enregistre, puis génère et stocke le PDF.
export async function creerDevis(donnees: DonneesNouveauDevis): Promise<ResultatCreationDevis> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Non authentifié." };
  }
  const userId = session.user.id;

  const parsed = schema.safeParse(donnees);
  if (!parsed.success) {
    return { succes: false, erreur: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  const data = parsed.data;

  const profil = await prisma.companyProfile.findUnique({ where: { userId }, select: { id: true } });
  if (!profil) {
    return { succes: false, erreur: "Complétez d'abord les informations de votre entreprise avant de créer un devis." };
  }

  const totaux = calculerTotauxDevis(data.lignes);

  const quote = await prisma.$transaction(async (tx) => {
    const numero = await genererNumeroDevis(tx, userId);
    return tx.clientQuote.create({
      data: {
        userId,
        numero,
        clientNom: data.clientNom,
        clientAdresse: data.clientAdresse?.trim() || null,
        clientSiret: data.clientSiret?.trim() || null,
        clientEmail: data.clientEmail?.trim() || null,
        dureeValiditeJours: data.dureeValiditeJours,
        conditionsPaiement: data.conditionsPaiement,
        promptOriginal: data.promptOriginal?.trim() || null,
        totalHt: totaux.totalHt,
        totalTva: totaux.totalTva,
        totalTtc: totaux.totalTtc,
        lines: {
          create: data.lignes.map((l, i) => ({
            ordre: i,
            designation: l.designation,
            quantite: l.quantite,
            prixUnitaireHt: l.prixUnitaireHt,
            tauxTva: l.tauxTva,
            totalHt: Math.round(l.quantite * l.prixUnitaireHt * 100) / 100,
          })),
        },
      },
      include: { lines: true },
    });
  });

  // Le PDF est généré après la transaction (appel réseau vers Supabase Storage, pas de
  // raison de le garder dans la transaction DB) — un échec ici laisse le devis créé
  // sans PDF plutôt que de perdre la saisie de l'artisan ; la page de détail propose
  // alors de réessayer (voir devis-clients/[id]/actions.ts).
  await genererEtStockerPdfDevis(userId, quote, quote.lines);

  return { succes: true, id: quote.id };
}

export type ResultatGenerationIA =
  | { succes: true; clientNom: string | null; lignes: z.infer<typeof ligneSchema>[] }
  | { succes: false; erreur: string };

// Étape 2 du chantier : transforme un prompt texte (tapé ou dicté, voir étape 3) en
// lignes de devis structurées via Claude — ne crée rien en base, se contente de
// retourner un aperçu que l'artisan corrige avant validation (voir creerDevis
// ci-dessus, qui reçoit ces lignes potentiellement modifiées).
export async function genererDepuisPrompt(texte: string): Promise<ResultatGenerationIA> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Non authentifié." };
  }
  const userId = session.user.id;

  const texteNettoye = texte.trim();
  if (texteNettoye.length < 5) {
    return { succes: false, erreur: "Décrivez la prestation avant de générer les lignes." };
  }

  const utilisateur = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, subscriptionStatus: true },
  });
  const profil = await prisma.companyProfile.findUnique({ where: { userId }, select: { regimeTva: true } });
  if (!utilisateur || !profil) {
    return { succes: false, erreur: "Complétez d'abord les informations de votre entreprise." };
  }

  // Quota mensuel dédié à la génération IA — distinct du quota d'upload de documents
  // (voir src/lib/quota.ts). Compté via GenerationIA (voir schema.prisma), partagé avec
  // la reconstruction IA d'un devis existant (modifierLignesAvecIA) — remplace l'ancien
  // comptage sur ClientQuote.promptOriginal qui ne capturait pas les modifications.
  const quotaMensuel = quotaDevisIA(utilisateur.plan, utilisateur.subscriptionStatus);
  const genereesCeMois = await prisma.generationIA.count({
    where: { userId, createdAt: { gte: debutMoisUTC(new Date()) } },
  });
  if (genereesCeMois >= quotaMensuel) {
    return {
      succes: false,
      erreur: `Quota de génération IA atteint pour ce mois (${quotaMensuel}). Vous pouvez toujours créer un devis manuellement.`,
    };
  }

  if (!verifierRateLimitDevisIA(userId)) {
    return {
      succes: false,
      erreur: "Trop de générations IA en peu de temps. Réessayez dans une heure.",
    };
  }

  try {
    const resultat = await genererLignesDevisDepuisPrompt(texteNettoye, profil.regimeTva);
    if (resultat.lignes.length === 0) {
      return { succes: false, erreur: "Aucune ligne n'a pu être identifiée dans ce texte — reformulez ou complétez à la main." };
    }
    await prisma.generationIA.create({ data: { userId } });
    return { succes: true, clientNom: resultat.clientNom, lignes: resultat.lignes };
  } catch (e) {
    console.error("Échec de la génération IA du devis :", e);
    return { succes: false, erreur: "La génération a échoué, réessayez ou complétez le devis manuellement." };
  }
}

export type ResultatSuggestionPrix =
  | { succes: true; suggestion: SuggestionPrix | null }
  | { succes: false; erreur: string };

// Suggestion de prix pour une ligne de devis, à partir de l'historique d'achat
// fournisseur de l'artisan (voir src/lib/suggestionPrix.ts) — appelée à la volée pendant
// la saisie (lookup débouncé côté client), jamais appliquée automatiquement : l'artisan
// valide explicitement via le bouton "Utiliser".
export async function suggererPrix(referenceTexte: string): Promise<ResultatSuggestionPrix> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Non authentifié." };
  }
  const userId = session.user.id;

  const profil = await prisma.companyProfile.findUnique({ where: { userId }, select: { margeParDefautPct: true } });
  if (!profil) {
    return { succes: false, erreur: "Complétez d'abord les informations de votre entreprise." };
  }

  const suggestion = await suggererPrixAchat(prisma, {
    userId,
    referenceTexte,
    margeParDefautPct: Number(profil.margeParDefautPct),
  });
  return { succes: true, suggestion };
}
