"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculerTotauxDevis, genererEtStockerPdfDevis } from "@/lib/devisClients";
import { genererLignesDevisModifiees } from "@/lib/genererDevisIA";
import { quotaDevisIA, debutMoisUTC } from "@/lib/quota";
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
  dureeValiditeJours: z.number().int().positive(),
  conditionsPaiement: z.string().trim().min(1, "Les conditions de paiement sont requises."),
  lignes: z.array(ligneSchema).min(1, "Ajoutez au moins une ligne."),
});

export type DonneesModificationDevis = z.input<typeof schema>;
export type ResultatModificationDevis = { succes: true; id: string } | { succes: false; erreur: string };

// Un devis déjà transformé en facture est verrouillé — une facture émise ne se corrige
// pas légalement, voir transformerEnFacture dans devis-clients/[id]/actions.ts qui pose
// la relation ClientQuote.invoice. Revérifié ici côté serveur à chaque action (pas
// seulement au chargement de la page modifier/page.tsx) : la page peut être restée
// ouverte dans un onglet pendant qu'une autre transforme le devis entre-temps.
async function erreurSiDevisNonModifiable(clientQuoteId: string, userId: string): Promise<string | null> {
  const quote = await prisma.clientQuote.findFirst({
    where: { id: clientQuoteId, userId },
    select: { invoice: { select: { id: true } } },
  });
  if (!quote) return "Devis introuvable.";
  if (quote.invoice) return "Ce devis a déjà été transformé en facture et ne peut plus être modifié.";
  return null;
}

// Enregistre la correction d'un devis existant (saisie manuelle et/ou reconstruction IA
// préalable, voir modifierLignesAvecIA ci-dessous) : recalcule les totaux, remplace les
// lignes, régénère le PDF. Le numéro et la date d'émission d'origine ne sont jamais
// modifiés (seule la création en génère un, voir genererNumeroDevis).
export async function mettreAJourDevis(
  clientQuoteId: string,
  donnees: DonneesModificationDevis
): Promise<ResultatModificationDevis> {
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

  const erreurVerification = await erreurSiDevisNonModifiable(clientQuoteId, userId);
  if (erreurVerification) {
    return { succes: false, erreur: erreurVerification };
  }

  const totaux = calculerTotauxDevis(data.lignes);

  const quote = await prisma.$transaction(async (tx) => {
    await tx.clientQuoteLine.deleteMany({ where: { clientQuoteId } });
    return tx.clientQuote.update({
      where: { id: clientQuoteId },
      data: {
        clientNom: data.clientNom,
        clientAdresse: data.clientAdresse?.trim() || null,
        dureeValiditeJours: data.dureeValiditeJours,
        conditionsPaiement: data.conditionsPaiement,
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

  // Comme pour la création (voir nouveau/actions.ts), l'échec du PDF ne fait pas échouer
  // l'enregistrement — le devis reste à jour en base, la page de détail propose de
  // réessayer via BoutonRegenererPdf.
  await genererEtStockerPdfDevis(userId, quote, quote.lines);
  revalidatePath(`/devis-clients/${clientQuoteId}`);

  return { succes: true, id: clientQuoteId };
}

export type ResultatGenerationIA =
  | { succes: true; clientNom: string | null; lignes: z.infer<typeof ligneSchema>[] }
  | { succes: false; erreur: string };

// Reconstruction IA des lignes d'un devis existant à partir d'une instruction en langage
// naturel (tapée ou dictée) — réutilise le même pipeline que la création
// (src/lib/genererDevisIA.ts) en lui passant les lignes actuelles plutôt que de repartir
// de zéro, pour que les lignes non concernées par l'instruction soient conservées telles
// quelles. Ne modifie rien en base : retourne un aperçu que l'artisan valide via
// mettreAJourDevis, comme pour la création.
export async function modifierLignesAvecIA(
  clientQuoteId: string,
  instruction: string,
  lignesActuelles: z.infer<typeof ligneSchema>[]
): Promise<ResultatGenerationIA> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Non authentifié." };
  }
  const userId = session.user.id;

  const instructionNettoyee = instruction.trim();
  if (instructionNettoyee.length < 5) {
    return { succes: false, erreur: "Décrivez la modification avant de l'appliquer." };
  }

  const erreurVerification = await erreurSiDevisNonModifiable(clientQuoteId, userId);
  if (erreurVerification) {
    return { succes: false, erreur: erreurVerification };
  }

  const utilisateur = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, subscriptionStatus: true },
  });
  const profil = await prisma.companyProfile.findUnique({ where: { userId }, select: { regimeTva: true } });
  if (!utilisateur || !profil) {
    return { succes: false, erreur: "Complétez d'abord les informations de votre entreprise." };
  }

  // Même quota mensuel que la création, partagé via GenerationIA (voir
  // nouveau/actions.ts) — une reconstruction IA coûte le même ordre de grandeur qu'une
  // génération initiale.
  const quotaMensuel = quotaDevisIA(utilisateur.plan, utilisateur.subscriptionStatus);
  const genereesCeMois = await prisma.generationIA.count({
    where: { userId, createdAt: { gte: debutMoisUTC(new Date()) } },
  });
  if (genereesCeMois >= quotaMensuel) {
    return {
      succes: false,
      erreur: `Quota de génération IA atteint pour ce mois (${quotaMensuel}). Vous pouvez toujours modifier les lignes manuellement.`,
    };
  }

  try {
    const resultat = await genererLignesDevisModifiees(lignesActuelles, instructionNettoyee, profil.regimeTva);
    if (resultat.lignes.length === 0) {
      return {
        succes: false,
        erreur: "L'IA n'a produit aucune ligne — reformulez l'instruction ou modifiez le devis manuellement.",
      };
    }
    await prisma.generationIA.create({ data: { userId } });
    return { succes: true, clientNom: resultat.clientNom, lignes: resultat.lignes };
  } catch (e) {
    console.error("Échec de la reconstruction IA du devis :", e);
    return { succes: false, erreur: "La modification a échoué, réessayez ou corrigez le devis manuellement." };
  }
}

export type ResultatSuggestionPrix =
  | { succes: true; suggestion: SuggestionPrix | null }
  | { succes: false; erreur: string };

// Identique à nouveau/actions.ts::suggererPrix — dupliqué plutôt que factorisé dans
// devisClients.ts, chaque action serveur restant un point d'entrée fin (auth + lecture du
// profil) au-dessus de la même logique métier partagée (suggererPrixAchat).
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
