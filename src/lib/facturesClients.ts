// Aides communes aux factures clients (ClientInvoice/ClientInvoiceLine) — même rôle que
// devisClients.ts pour les devis. Distinct de src/lib/comparaisonPrix.ts et
// src/lib/historique.ts, qui portent sur les factures FOURNISSEURS (Document/
// type=FACTURE) : aucun code partagé entre les deux, volontairement.
import type { ClientInvoice, ClientInvoiceLine, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin } from "@/lib/supabase";
import { genererPdfFacture } from "@/lib/facturePdf";
import { construireInfoEntreprisePourPdf } from "@/lib/devisClients";

// Numéro séquentiel "F-AAAA-NNN" (ex. "F2026-003") : préfixe "F" pour ne jamais se
// confondre visuellement avec un numéro de devis (voir genererNumeroDevis dans
// devisClients.ts, même principe de compteur atomique sur CompanyProfile — appeler DANS
// la même transaction que la création du ClientInvoice).
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

// Même logique que genererEtStockerPdfDevis (devisClients.ts) : génère le PDF pour un
// ClientInvoice déjà enregistré en base, le stocke dans Supabase Storage, met à jour son
// pdfKey. Ne fait rien si l'entreprise n'a pas de profil "Mon entreprise" (impossible en
// pratique, la transformation est bloquée avant).
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
