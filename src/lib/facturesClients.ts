// Aides communes aux factures clients (ClientInvoice/ClientInvoiceLine) — même rôle que
// devisClients.ts pour les devis. Distinct de src/lib/comparaisonPrix.ts et
// src/lib/historique.ts, qui portent sur les factures FOURNISSEURS (Document/
// type=FACTURE) : aucun code partagé entre les deux, volontairement.
import type { ClientInvoice, ClientInvoiceLine, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin } from "@/lib/supabase";
import { genererPdfFacture } from "@/lib/facturePdf";
import { construireInfoEntreprisePourPdf } from "@/lib/devisClients";

export type StatutFactureClient = "envoyee" | "payee" | "en_retard" | "brouillon";

export interface FactureClientListe {
  id: string;
  numero: string;
  clientNom: string;
  montantHt: number;
  statut: StatutFactureClient;
  dateEmission: Date;
  dateEcheance: Date;
  devisNumero: string | null;
}

export function formaterMontantFacture(valeur: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valeur);
}

export function formaterDateFacture(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function deduireStatutFacture(invoice: { dateEcheance: Date }): StatutFactureClient {
  if (invoice.dateEcheance < new Date()) return "en_retard";
  return "envoyee";
}

export async function listerFacturesUtilisateur(userId: string): Promise<FactureClientListe[]> {
  const factures = await prisma.clientInvoice.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { clientQuote: { select: { numero: true } } },
  });

  return factures.map((f) => ({
    id: f.id,
    numero: f.numero,
    clientNom: f.clientNom,
    montantHt: Number(f.totalHt),
    statut: deduireStatutFacture(f),
    dateEmission: f.dateEmission,
    dateEcheance: f.dateEcheance,
    devisNumero: f.clientQuote?.numero ?? null,
  }));
}

export async function genererNumeroFacture(
  tx: Prisma.TransactionClient | PrismaClient,
  userId: string
): Promise<string> {
  const profil = await tx.companyProfile.update({
    where: { userId },
    data: { nextInvoiceNumber: { increment: 1 } },
    select: { nextInvoiceNumber: true },
  });
  const annee = new Date().getUTCFullYear();
  const numeroSequentiel = profil.nextInvoiceNumber - 1;
  return `F${annee}-${String(numeroSequentiel).padStart(3, "0")}`;
}

export async function genererEtStockerPdfFacture(
  userId: string,
  facture: ClientInvoice,
  lignes: ClientInvoiceLine[],
  numeroDevisOrigine: string | null
): Promise<{ succes: boolean }> {
  const entreprise = await construireInfoEntreprisePourPdf(userId);
  if (!entreprise) return { succes: false };

  try {
    const buffer = await genererPdfFacture(entreprise, {
      numero: facture.numero,
      dateEmission: facture.dateEmission,
      dateEcheance: facture.dateEcheance,
      conditionsPaiement: facture.conditionsPaiement,
      clientNom: facture.clientNom,
      clientAdresse: facture.clientAdresse,
      lignes: [...lignes]
        .sort((a, b) => a.ordre - b.ordre)
        .map((l) => ({
          designation: l.designation,
          quantite: Number(l.quantite),
          prixUnitaireHt: Number(l.prixUnitaireHt),
          tauxTva: Number(l.tauxTva),
          totalHt: Number(l.totalHt),
        })),
      totalHt: Number(facture.totalHt),
      totalTva: Number(facture.totalTva),
      totalTtc: Number(facture.totalTtc),
      numeroDevisOrigine,
    });

    const pdfKey = `factures-clients/${userId}/${facture.id}.pdf`;
    const { error } = await getSupabaseAdmin().storage
      .from(DOCUMENTS_BUCKET)
      .upload(pdfKey, buffer, { contentType: "application/pdf", upsert: true });

    if (error) {
      console.error("Échec de l'upload du PDF de facture vers Supabase Storage :", error);
      return { succes: false };
    }

    await prisma.clientInvoice.update({ where: { id: facture.id }, data: { pdfKey } });
    return { succes: true };
  } catch (e) {
    console.error("Échec de la génération du PDF de facture :", e);
    return { succes: false };
  }
}
