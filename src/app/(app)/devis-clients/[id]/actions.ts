"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { genererEtStockerPdfDevis } from "@/lib/devisClients";
import { genererNumeroFacture, genererEtStockerPdfFacture } from "@/lib/facturesClients";

export async function regenererPdfDevis(clientQuoteId: string): Promise<{ succes: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { succes: false };

  const quote = await prisma.clientQuote.findFirst({
    where: { id: clientQuoteId, userId: session.user.id },
    include: { lines: true },
  });
  if (!quote) return { succes: false };

  const resultat = await genererEtStockerPdfDevis(session.user.id, quote, quote.lines);
  if (resultat.succes) {
    revalidatePath(`/devis-clients/${clientQuoteId}`);
  }
  return resultat;
}

export type ResultatTransformation = { succes: true; factureId: string } | { succes: false; erreur: string };

// Transforme un devis en facture : reprend les mêmes lignes et totaux (même prestation,
// pas de raison de les recalculer), une numérotation et une date d'émission propres à la
// facture, une échéance à 30 jours par défaut, et une référence vers le devis d'origine.
// Le devis n'est jamais modifié ni remplacé (voir ClientQuote.invoice, @unique côté
// ClientInvoice.clientQuoteId — un devis ne peut être transformé qu'une seule fois).
export async function transformerEnFacture(clientQuoteId: string): Promise<ResultatTransformation> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Non authentifié." };
  }
  const userId = session.user.id;

  const quote = await prisma.clientQuote.findFirst({
    where: { id: clientQuoteId, userId },
    include: { lines: true, invoice: { select: { id: true } } },
  });
  if (!quote) {
    return { succes: false, erreur: "Devis introuvable." };
  }
  if (quote.invoice) {
    return { succes: false, erreur: "Ce devis a déjà été transformé en facture." };
  }

  const dateEmission = new Date();
  const dateEcheance = new Date(dateEmission);
  dateEcheance.setDate(dateEcheance.getDate() + 30);

  const facture = await prisma.$transaction(async (tx) => {
    const numero = await genererNumeroFacture(tx, userId);
    return tx.clientInvoice.create({
      data: {
        userId,
        numero,
        clientNom: quote.clientNom,
        clientAdresse: quote.clientAdresse,
        clientSiret: quote.clientSiret,
        clientEmail: quote.clientEmail,
        dateEmission,
        dateEcheance,
        conditionsPaiement: quote.conditionsPaiement,
        totalHt: quote.totalHt,
        totalTva: quote.totalTva,
        totalTtc: quote.totalTtc,
        clientQuoteId: quote.id,
        lines: {
          create: quote.lines.map((l) => ({
            ordre: l.ordre,
            designation: l.designation,
            quantite: l.quantite,
            prixUnitaireHt: l.prixUnitaireHt,
            tauxTva: l.tauxTva,
            totalHt: l.totalHt,
          })),
        },
      },
      include: { lines: true },
    });
  });

  await genererEtStockerPdfFacture(userId, facture, facture.lines, quote.numero);

  revalidatePath(`/devis-clients/${clientQuoteId}`);
  return { succes: true, factureId: facture.id };
}
