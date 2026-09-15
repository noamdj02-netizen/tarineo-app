"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normaliserReference, normaliserDistributeur } from "@/lib/normalisation";
import { comparerLignesAuHistorique, creerAlertesHausse } from "@/lib/comparaisonPrix";

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
    const comparaisons = await comparerLignesAuHistorique(tx, {
      userId,
      distributor,
      documentId,
      documentDate: date,
      lignes: lignesAvecRef.map((l) => ({
        referenceNorm: l.referenceNorm,
        unitPriceHt: l.unitPriceHt,
        manufacturerRefNorm: l.manufacturerRefNorm,
      })),
    });

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

  revalidatePath(`/documents/${documentId}`);
  revalidatePath("/documents");

  return { succes: true };
}
