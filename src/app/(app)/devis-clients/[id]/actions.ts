"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { genererEtStockerPdfDevis } from "@/lib/devisClients";
import { genererNumeroFacture, genererEtStockerPdfFacture } from "@/lib/facturesClients";
import { accesDevisClientPdf } from "@/lib/planGating";
import { DOCUMENTS_BUCKET, getSupabaseAdmin } from "@/lib/supabase";
import { envoyerEmailDocument } from "@/lib/email";

export async function regenererPdfDevis(
  clientQuoteId: string,
): Promise<{ succes: boolean; erreurPlan?: boolean }> {
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

export type ResultatEnvoiDevis = { succes: true } | { succes: false; erreur: string };

export async function envoyerDevisParEmail(clientQuoteId: string): Promise<ResultatEnvoiDevis> {
  const session = await auth();
  if (!session?.user?.id) return { succes: false, erreur: "Non authentifié." };

  const [quote, utilisateur, profil] = await Promise.all([
    prisma.clientQuote.findFirst({
      where: { id: clientQuoteId, userId: session.user.id },
      include: { lines: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, subscriptionStatus: true, name: true },
    }),
    prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
      select: { raisonSociale: true, emailContact: true },
    }),
  ]);

  if (!quote) return { succes: false, erreur: "Devis introuvable." };
  if (!quote.clientEmail?.trim()) return { succes: false, erreur: "Email client manquant." };
  if (!utilisateur || !accesDevisClientPdf(utilisateur.plan, utilisateur.subscriptionStatus)) {
    return { succes: false, erreur: "PDF devis réservé au plan Pro." };
  }

  let pdfKey = quote.pdfKey;
  if (!pdfKey) {
    const genere = await genererEtStockerPdfDevis(session.user.id, quote, quote.lines);
    if (!genere.succes) return { succes: false, erreur: "Impossible de générer le PDF." };
    const misAJour = await prisma.clientQuote.findUnique({
      where: { id: quote.id },
      select: { pdfKey: true },
    });
    pdfKey = misAJour?.pdfKey ?? null;
  }
  if (!pdfKey) return { succes: false, erreur: "PDF introuvable." };

  const { data, error } = await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).download(pdfKey);
  if (error || !data) return { succes: false, erreur: "Téléchargement du PDF impossible." };

  const entreprise = profil?.raisonSociale ?? session.user.name ?? "Votre artisan";
  const replyTo = profil?.emailContact ?? session.user.email ?? undefined;
  const corps = `Bonjour ${quote.clientNom},\n\nVeuillez trouver ci-joint notre devis n° ${quote.numero}.\n\nCordialement,\n${entreprise}`;

  try {
    await envoyerEmailDocument({
      to: quote.clientEmail.trim(),
      subject: `Devis n° ${quote.numero} — ${entreprise}`,
      body: corps,
      replyTo,
      attachment: {
        filename: `devis-${quote.numero}.pdf`,
        content: Buffer.from(await data.arrayBuffer()),
      },
    });
  } catch {
    return { succes: false, erreur: "L'envoi par email a échoué. Réessayez." };
  }

  return { succes: true };
}

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
