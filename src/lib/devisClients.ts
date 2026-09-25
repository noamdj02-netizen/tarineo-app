// Aides communes aux devis clients (ClientQuote/ClientQuoteLine) — numérotation et
// calcul des totaux. Distinct de src/lib/comparaisonPrix.ts et src/lib/historique.ts,
// qui portent sur les devis FOURNISSEURS (Document/type=DEVIS) : aucun code partagé
// entre les deux, volontairement.
import type { ClientQuote, ClientQuoteLine, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin } from "@/lib/supabase";
import { genererPdfDevis, type EntrepriseInfoPdf } from "@/lib/devisPdf";
import { quotaDevisIA, debutMoisUTC } from "@/lib/quota";
import { accesDevisClientPdf } from "@/lib/planGating";

export {
  CONDITIONS_PAIEMENT_PAR_DEFAUT,
  DUREE_VALIDITE_PAR_DEFAUT,
  PRESETS_CONDITIONS_PAIEMENT,
  PRESETS_VALIDITE_JOURS,
} from "@/lib/devisClientsConstants";

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
): Promise<{ succes: boolean; erreurPlan?: boolean }> {
  const utilisateur = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, subscriptionStatus: true },
  });
  if (!utilisateur || !accesDevisClientPdf(utilisateur.plan, utilisateur.subscriptionStatus)) {
    return { succes: false, erreurPlan: true };
  }

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
/** Statut affiché en liste/détail — dérivé du modèle (pas de colonne `statut` en base). */
export type StatutDevisClient = "envoye" | "accepte" | "expire" | "brouillon" | "refuse";

export interface DevisClientListe {
  id: string;
  numero: string;
  clientNom: string;
  montantHt: number;
  statut: StatutDevisClient;
  dateEmission: Date;
}

export function formaterMontantDevis(valeur: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valeur);
}

export function formaterDateDevis(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function deduireStatutDevis(
  quote: { dateEmission: Date; dureeValiditeJours: number; invoice?: { id: string } | null },
  maintenant = new Date()
): StatutDevisClient {
  if (quote.invoice) return "accepte";
  const finValidite = new Date(quote.dateEmission);
  finValidite.setUTCDate(finValidite.getUTCDate() + quote.dureeValiditeJours);
  if (finValidite < maintenant) return "expire";
  return "envoye";
}

export function filtrerDevis(devis: DevisClientListe[], q: string): DevisClientListe[] {
  const terme = q.trim().toLowerCase();
  if (!terme) return devis;
  return devis.filter((d) => d.numero.toLowerCase().includes(terme) || d.clientNom.toLowerCase().includes(terme));
}

export function calculerStatsDevis(devis: DevisClientListe[]) {
  let totalHt = 0;
  let acceptes = 0;
  let enCours = 0;
  let expires = 0;
  for (const d of devis) {
    totalHt += d.montantHt;
    if (d.statut === "accepte") acceptes++;
    else if (d.statut === "expire") expires++;
    else enCours++;
  }
  const tauxTransformation = devis.length > 0 ? Math.round((acceptes / devis.length) * 100) : 0;
  return { total: devis.length, totalHt, acceptes, enCours, expires, tauxTransformation };
}

export function dateFinValiditeDevis(dateEmission: Date, dureeValiditeJours: number): Date {
  const fin = new Date(dateEmission);
  fin.setUTCDate(fin.getUTCDate() + dureeValiditeJours);
  return fin;
}

export async function listerDevisUtilisateur(userId: string): Promise<DevisClientListe[]> {
  const quotes = await prisma.clientQuote.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { invoice: { select: { id: true } } },
  });
  const maintenant = new Date();
  return quotes.map((q) => ({
    id: q.id,
    numero: q.numero,
    clientNom: q.clientNom,
    montantHt: Number(q.totalHt),
    statut: deduireStatutDevis(q, maintenant),
    dateEmission: q.dateEmission,
  }));
}

export async function etatQuotaDevisIA(userId: string): Promise<{ restantes: number; total: number }> {
  const [utilisateur, genereesCeMois] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true, subscriptionStatus: true } }),
    prisma.generationIA.count({ where: { userId, createdAt: { gte: debutMoisUTC(new Date()) } } }),
  ]);
  const total = quotaDevisIA(utilisateur?.plan ?? null, utilisateur?.subscriptionStatus ?? null);
  return { restantes: Math.max(0, total - genereesCeMois), total };
}
