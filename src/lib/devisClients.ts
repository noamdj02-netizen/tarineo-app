// Aides communes aux devis clients (ClientQuote/ClientQuoteLine) — numérotation et
// calcul des totaux. Distinct de src/lib/comparaisonPrix.ts et src/lib/historique.ts,
// qui portent sur les devis FOURNISSEURS (Document/type=DEVIS) : aucun code partagé
// entre les deux, volontairement.
import type { ClientQuote, ClientQuoteLine, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin } from "@/lib/supabase";
import { genererPdfDevis, type EntrepriseInfoPdf } from "@/lib/devisPdf";
import { quotaDevisIA, debutMoisUTC } from "@/lib/quota";
import { masquerIban } from "@/lib/entreprise";

// Partagé entre la création (devis-clients/nouveau/page.tsx) et la modification
// (devis-clients/[id]/modifier/page.tsx) d'un devis.
export const CONDITIONS_PAIEMENT_PAR_DEFAUT = "Acompte de 30% à la commande, solde à réception des travaux.";

const EXTENSION_VERS_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

// Charge le profil "Mon entreprise" et prépare le logo en data URI (téléchargé une
// fois depuis Supabase Storage et embarqué directement dans le PDF) — utilisé aussi
// bien par la création manuelle (étape 1) que par le pipeline IA (étape 2), pour ne pas
// dupliquer cette construction à chaque point d'entrée.
export async function construireInfoEntreprisePourPdf(userId: string): Promise<EntrepriseInfoPdf | null> {
  const profil = await prisma.companyProfile.findUnique({ where: { userId } });
  if (!profil) return null;

  let logoDataUrl: string | null = null;
  if (profil.logoKey) {
    const { data } = await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).download(profil.logoKey);
    if (data) {
      const extension = profil.logoKey.split(".").pop()?.toLowerCase() ?? "";
      const mime = EXTENSION_VERS_MIME[extension] ?? "image/png";
      const buffer = Buffer.from(await data.arrayBuffer());
      logoDataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    }
  }

  return {
    raisonSociale: profil.raisonSociale,
    siret: profil.siret,
    formeJuridique: profil.formeJuridique,
    adresseRue: profil.adresseRue,
    adresseCodePostal: profil.adresseCodePostal,
    adresseVille: profil.adresseVille,
    telephone: profil.telephone,
    emailContact: profil.emailContact,
    regimeTva: profil.regimeTva,
    registreImmatriculation: profil.registreImmatriculation,
    assuranceNom: profil.assuranceNom,
    assuranceAdresse: profil.assuranceAdresse,
    assuranceNumeroContrat: profil.assuranceNumeroContrat,
    assuranceActivitesGaranties: profil.assuranceActivitesGaranties,
    assuranceZoneGeographique: profil.assuranceZoneGeographique,
    logoDataUrl,
    numeroTva: profil.numeroTva,
    ibanMasque: profil.iban ? masquerIban(profil.iban) : null,
    mentionsLegales: profil.mentionsLegales,
    couleurPrimaire: profil.couleurPrimaire,
  };
}

// Numéro séquentiel "AAAA-NNN" (ex. "2026-014"), sans trou même après suppression d'un
// devis : incrémente CompanyProfile.nextQuoteNumber de façon atomique plutôt que de
// recompter les ClientQuote existants. Doit être appelé DANS la même transaction que la
// création du ClientQuote (voir devis-clients/nouveau/actions.ts) pour éviter une
// collision entre deux générations concurrentes.
export async function genererNumeroDevis(
  tx: Prisma.TransactionClient | PrismaClient,
  userId: string
): Promise<string> {
  const profil = await tx.companyProfile.update({
    where: { userId },
    data: { nextQuoteNumber: { increment: 1 } },
    select: { nextQuoteNumber: true },
  });
  const annee = new Date().getUTCFullYear();
  // nextQuoteNumber vient d'être incrémenté : le numéro à utiliser est la valeur
  // précédente, donc nextQuoteNumber - 1.
  const numeroSequentiel = profil.nextQuoteNumber - 1;
  return `${annee}-${String(numeroSequentiel).padStart(3, "0")}`;
}

export interface LigneDevisCalcul {
  quantite: number;
  prixUnitaireHt: number;
  tauxTva: number;
}

// Total TVA calculé par regroupement de taux (plusieurs lignes peuvent avoir des taux
// différents, ex. 10% main d'œuvre rénovation / 20% matériel neuf) plutôt qu'un taux
// unique appliqué au total — plus exact et plus consultable si le PDF doit un jour
// détailler la TVA par taux.
export function calculerTotauxDevis(lignes: LigneDevisCalcul[]) {
  const totalHt = lignes.reduce((somme, l) => somme + l.quantite * l.prixUnitaireHt, 0);
  const totalTva = lignes.reduce((somme, l) => somme + l.quantite * l.prixUnitaireHt * (l.tauxTva / 100), 0);
  return {
    totalHt: Math.round(totalHt * 100) / 100,
    totalTva: Math.round(totalTva * 100) / 100,
    totalTtc: Math.round((totalHt + totalTva) * 100) / 100,
  };
}

// Génère le PDF pour un ClientQuote déjà enregistré en base et le stocke dans Supabase
// Storage, puis met à jour son pdfKey — factorisé ici pour être appelé aussi bien après
// la création (devis-clients/nouveau/actions.ts) qu'au bouton "Régénérer" de la page de
// détail (devis-clients/[id]/actions.ts). Ne fait rien si l'entreprise n'a pas encore de
// profil "Mon entreprise" (impossible en pratique, la création est bloquée avant, mais
// couvre un profil supprimé entre-temps).
export async function genererEtStockerPdfDevis(
  userId: string,
  quote: ClientQuote,
  lignes: ClientQuoteLine[]
): Promise<{ succes: boolean }> {
  const entreprise = await construireInfoEntreprisePourPdf(userId);
  if (!entreprise) return { succes: false };

  try {
    const buffer = await genererPdfDevis(entreprise, {
      numero: quote.numero,
      dateEmission: quote.dateEmission,
      dureeValiditeJours: quote.dureeValiditeJours,
      conditionsPaiement: quote.conditionsPaiement,
      clientNom: quote.clientNom,
      clientAdresse: quote.clientAdresse,
      lignes: [...lignes]
        .sort((a, b) => a.ordre - b.ordre)
        .map((l) => ({
          designation: l.designation,
          quantite: Number(l.quantite),
          prixUnitaireHt: Number(l.prixUnitaireHt),
          tauxTva: Number(l.tauxTva),
          totalHt: Number(l.totalHt),
        })),
      totalHt: Number(quote.totalHt),
      totalTva: Number(quote.totalTva),
      totalTtc: Number(quote.totalTtc),
    });

    const pdfKey = `devis-clients/${userId}/${quote.id}.pdf`;
    const { error } = await getSupabaseAdmin().storage
      .from(DOCUMENTS_BUCKET)
      .upload(pdfKey, buffer, { contentType: "application/pdf", upsert: true });

    if (error) {
      console.error("Échec de l'upload du PDF de devis vers Supabase Storage :", error);
      return { succes: false };
    }

    await prisma.clientQuote.update({ where: { id: quote.id }, data: { pdfKey } });
    return { succes: true };
  } catch (e) {
    console.error("Échec de la génération du PDF de devis :", e);
    return { succes: false };
  }
}

// État du quota mensuel de génération/reconstruction IA (voir GenerationIA — création
// via genererDepuisPrompt ET modification via modifierLignesAvecIA comptent toutes les
// deux) — factorisé ici pour être calculé de façon identique par nouveau/page.tsx et
// [id]/modifier/page.tsx.
export async function etatQuotaDevisIA(userId: string): Promise<{ restantes: number; total: number }> {
  const [utilisateur, genereesCeMois] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true, subscriptionStatus: true } }),
    prisma.generationIA.count({ where: { userId, createdAt: { gte: debutMoisUTC(new Date()) } } }),
  ]);
  const total = quotaDevisIA(utilisateur?.plan ?? null, utilisateur?.subscriptionStatus ?? null);
  return { restantes: Math.max(0, total - genereesCeMois), total };
}
