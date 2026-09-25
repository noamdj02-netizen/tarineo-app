"use server";

import { Prisma } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normaliserReference, normaliserDistributeur } from "@/lib/normalisation";
import { comparerLignesAuHistorique, creerAlertesHausse } from "@/lib/comparaisonPrix";
import { dateMinHistoriquePlan } from "@/lib/planGating";
import { verifierRateLimitAnalyse } from "@/lib/rateLimitIA";
import { redirect } from "next/navigation";
import { analyserDocument } from "@/lib/extraction";
import { isAnthropicConfigured } from "@/lib/anthropic";
import { DOCUMENTS_BUCKET, getSupabaseAdmin } from "@/lib/supabase";
import { envoyerEmailDocument } from "@/lib/email";
import { redigerEmailDocument, type IntentionEmailDocument } from "@/lib/redigerEmailDocument";
import { LABELS_TYPE, TYPES_ACHAT_REEL } from "@/lib/documentLabels";

const ligneSchema = z.object({
  reference: z.string().trim().min(1),
  manufacturerRef: z.string().trim().optional(),
  designation: z.string().trim().min(1),
  quantity: z.number().positive(),
  unitPriceHt: z.number().min(0),
  totalHt: z.number().min(0),
});

const schema = z.object({
  type: z.enum(["DEVIS", "FACTURE", "BON_COMMANDE", "BON_ENLEVEMENT"]),
  distributor: z.string().trim().min(1),
  documentDate: z.string().min(1),
  totalHt: z.number().min(0),
  totalTtc: z.number().min(0),
  lignes: z.array(ligneSchema).min(1),
});

export type ResultatValidationDocument = { succes: true } | { succes: false; erreur: string };

export async function validerDocument(documentId: string, donnees: unknown): Promise<ResultatValidationDocument> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Non authentifié." };
  }

  const parsed = schema.safeParse(donnees);
  if (!parsed.success) {
    return { succes: false, erreur: "Données invalides. Vérifiez les champs du formulaire." };
  }

  const document = await prisma.document.findFirst({
    where: { id: documentId, userId: session.user.id },
  });
  if (!document) {
    return { succes: false, erreur: "Document introuvable." };
  }

  const { type, distributor, documentDate, totalHt, totalTtc, lignes } = parsed.data;
  const userId = session.user.id;
  const date = new Date(documentDate);
  const estAchatReel = TYPES_ACHAT_REEL.includes(type);

  await prisma.$transaction(async (tx) => {
    await tx.lineItem.deleteMany({ where: { documentId } });
    // Repartir de zéro : évite les doublons si l'artisan corrige un document déjà validé.
    await tx.priceHistory.deleteMany({ where: { documentId } });

    await tx.document.update({
      where: { id: documentId },
      data: {
        type,
        distributor,
        distributorNorm: normaliserDistributeur(distributor),
        documentDate: date,
        totalHt,
        totalTtc,
        status: "VALIDATED",
        // Un humain vient de relire et confirmer ce document — le signal de doublon
        // potentiel qui l'avait envoyé en revue manuelle est traité, pas ignoré.
        possibleDoublon: false,
      },
    });

    const lignesAvecRef = lignes.map((ligne) => ({
      ...ligne,
      referenceNorm: normaliserReference(ligne.reference),
      manufacturerRefNorm: ligne.manufacturerRef ? normaliserReference(ligne.manufacturerRef) : null,
    }));

    for (const ligne of lignesAvecRef) {
      await tx.lineItem.create({
        data: {
          documentId,
          userId,
          reference: ligne.reference,
          referenceNorm: ligne.referenceNorm,
          manufacturerRef: ligne.manufacturerRef || null,
          manufacturerRefNorm: ligne.manufacturerRefNorm,
          designation: ligne.designation,
          quantity: ligne.quantity,
          unitPriceHt: ligne.unitPriceHt,
          discountPct: 0,
          totalHt: ligne.totalHt,
        },
      });
    }

    // Comparé à l'historique AVANT d'y insérer les prix de ce document, sinon
    // chaque ligne se comparerait à elle-même (le nettoyage ci-dessus a déjà
    // retiré les anciennes entrées de ce document).
    const utilisateur = await tx.user.findUnique({
      where: { id: userId },
      select: { plan: true, subscriptionStatus: true },
    });
    const dateMinHistorique = dateMinHistoriquePlan(
      utilisateur?.plan ?? null,
      utilisateur?.subscriptionStatus ?? null,
      date,
    );
    const comparaisons = await comparerLignesAuHistorique(tx, {
      userId,
      distributor,
      documentId,
      documentDate: date,
      dateMinHistorique,
      lignes: lignesAvecRef.map((l) => ({
        referenceNorm: l.referenceNorm,
        unitPriceHt: l.unitPriceHt,
        manufacturerRefNorm: l.manufacturerRefNorm,
      })),
    });

    if (estAchatReel) {
      for (const ligne of lignesAvecRef) {
        await tx.priceHistory.create({
          data: {
            userId,
            referenceNorm: ligne.referenceNorm,
            manufacturerRefNorm: ligne.manufacturerRefNorm,
            distributor,
            distributorNorm: normaliserDistributeur(distributor),
            unitPriceHt: ligne.unitPriceHt,
            documentDate: date,
            documentId,
          },
        });
      }
    }

    await creerAlertesHausse(tx, {
      userId,
      documentId,
      distributor,
      lignes: lignesAvecRef.map((l) => ({
        reference: l.reference,
        designation: l.designation,
        referenceNorm: l.referenceNorm,
      })),
      comparaisons,
    });
  });

  const { synchroniserAlertesBfa } = await import("@/lib/alertesBfa");
  await synchroniserAlertesBfa(userId).catch((erreur) => {
    console.error("Synchronisation alertes BFA :", erreur);
  });

  revalidatePath(`/documents/${documentId}`);
  revalidatePath("/documents");
  revalidatePath("/accueil");

  return { succes: true };
}

export type ResultatRelanceAnalyse =
  | { succes: true }
  | { succes: false; erreur: "non_autorise" | "introuvable" | "ia_non_configuree" | "erreur" };

export async function relancerAnalyseDocument(documentId: string): Promise<ResultatRelanceAnalyse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "non_autorise" };
  }

  if (!isAnthropicConfigured()) {
    return { succes: false, erreur: "ia_non_configuree" };
  }

  const document = await prisma.document.findFirst({
    where: { id: documentId, userId: session.user.id },
    select: { id: true },
  });
  if (!document) {
    return { succes: false, erreur: "introuvable" };
  }

  if (!verifierRateLimitAnalyse(session.user.id)) {
    return { succes: false, erreur: "erreur" };
  }

  await prisma.$transaction([
    prisma.lineItem.deleteMany({ where: { documentId } }),
    prisma.priceHistory.deleteMany({ where: { documentId } }),
    prisma.document.update({
      where: { id: documentId },
      data: {
        status: "PROCESSING",
        distributor: null,
        distributorNorm: null,
        documentDate: null,
        totalHt: null,
        totalTtc: null,
        rawExtraction: Prisma.JsonNull,
        possibleDoublon: false,
      },
    }),
  ]);

  const analyseOk = await analyserDocument(documentId, session.user.id);

  revalidatePath(`/documents/${documentId}`);
  revalidatePath("/documents");

  if (!analyseOk) {
    return { succes: false, erreur: "erreur" };
  }

  return { succes: true };
}

export type ResultatActionDocument =
  | { succes: true }
  | { succes: false; erreur: string };

export async function reouvrirDocumentPourCorrection(documentId: string): Promise<ResultatActionDocument> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Non authentifié." };
  }

  const document = await prisma.document.findFirst({
    where: { id: documentId, userId: session.user.id },
    select: { id: true, status: true },
  });
  if (!document) {
    return { succes: false, erreur: "Document introuvable." };
  }
  if (document.status === "PROCESSING") {
    return { succes: false, erreur: "Attendez la fin de l'analyse avant de modifier." };
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "NEEDS_REVIEW" },
  });

  revalidatePath(`/documents/${documentId}`);
  return { succes: true };
}

export async function conserverBrouillonDocument(documentId: string): Promise<ResultatActionDocument> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Non authentifié." };
  }

  const document = await prisma.document.findFirst({
    where: { id: documentId, userId: session.user.id },
    select: { id: true, brouillonExpireAt: true },
  });
  if (!document) {
    return { succes: false, erreur: "Document introuvable." };
  }
  if (!document.brouillonExpireAt) {
    return { succes: true };
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { brouillonExpireAt: null },
  });

  revalidatePath(`/documents/${documentId}`);
  revalidatePath("/documents");
  revalidatePath("/accueil");
  revalidatePath("/analyses");
  return { succes: true };
}

export async function supprimerDocument(documentId: string): Promise<ResultatActionDocument> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Non authentifié." };
  }

  const document = await prisma.document.findFirst({
    where: { id: documentId, userId: session.user.id },
    select: { id: true, fileKey: true },
  });
  if (!document) {
    return { succes: false, erreur: "Document introuvable." };
  }

  await prisma.$transaction([
    prisma.lineItem.deleteMany({ where: { documentId } }),
    prisma.priceHistory.deleteMany({ where: { documentId } }),
    prisma.document.delete({ where: { id: documentId } }),
  ]);

  try {
    await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).remove([document.fileKey]);
  } catch (erreur) {
    console.error("Suppression fichier Supabase échouée :", erreur);
  }

  revalidatePath("/documents");
  redirect("/documents");
}

export type ResultatEmailDocument =
  | { succes: true; objet: string; corps: string }
  | { succes: false; erreur: string };

export async function genererEmailDocument(
  documentId: string,
  intention: IntentionEmailDocument,
  destinataire?: string
): Promise<ResultatEmailDocument> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Non authentifié." };
  }

  const document = await prisma.document.findFirst({
    where: { id: documentId, userId: session.user.id },
  });
  if (!document) {
    return { succes: false, erreur: "Document introuvable." };
  }

  const entreprise = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    select: { raisonSociale: true, emailContact: true },
  });

  const extraction = document.rawExtraction as { numero?: string | null } | null;
  const redaction = await redigerEmailDocument({
    document,
    entreprise,
    extraction,
    intention,
    destinataire: destinataire?.trim() || undefined,
  });

  return { succes: true, objet: redaction.objet, corps: redaction.corps };
}

const schemaEnvoiEmail = z.object({
  destinataire: z.string().trim().email("Adresse email invalide."),
  objet: z.string().trim().min(1, "Objet requis."),
  corps: z.string().trim().min(1, "Message requis."),
});

export async function envoyerDocumentParEmail(
  documentId: string,
  donnees: z.infer<typeof schemaEnvoiEmail>
): Promise<ResultatActionDocument> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Non authentifié." };
  }

  const parsed = schemaEnvoiEmail.safeParse(donnees);
  if (!parsed.success) {
    return { succes: false, erreur: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const document = await prisma.document.findFirst({
    where: { id: documentId, userId: session.user.id },
  });
  if (!document) {
    return { succes: false, erreur: "Document introuvable." };
  }

  const { data, error } = await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).download(document.fileKey);
  if (error || !data) {
    return { succes: false, erreur: "Fichier introuvable." };
  }

  const entreprise = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    select: { emailContact: true },
  });

  const extension = document.fileKey.split(".").pop() ?? "pdf";
  const typeLabel = (LABELS_TYPE[document.type] ?? "document").replace(/\s+/g, "-").toLowerCase();
  const distributeur = (document.distributor ?? "fournisseur").replace(/\s+/g, "-").toLowerCase();

  try {
    await envoyerEmailDocument({
      to: parsed.data.destinataire,
      subject: parsed.data.objet,
      body: parsed.data.corps,
      replyTo: entreprise?.emailContact ?? session.user.email ?? undefined,
      attachment: {
        filename: `${typeLabel}-${distributeur}.${extension}`,
        content: Buffer.from(await data.arrayBuffer()),
      },
    });
  } catch (erreur) {
    console.error("Envoi email document :", erreur);
    return { succes: false, erreur: "L'email n'a pas pu être envoyé. Vérifiez la configuration Resend." };
  }

  return { succes: true };
}
