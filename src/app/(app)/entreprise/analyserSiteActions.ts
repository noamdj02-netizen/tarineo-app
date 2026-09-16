"use server";

import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import {
  FetchSiteError,
  fetchBinaireSecurise,
  recupererPagesEntreprise,
} from "@/lib/fetchSiteSecurise";
import {
  compterChampsTrouves,
  extraireProfilDepuisIndices,
  preparerIndicesSite,
  type ExtractedCompanyProfile,
} from "@/lib/companyProfileExtraction";
import {
  normaliserCouleurHex,
  normaliserEmail,
  normaliserIban,
  normaliserNumeroTva,
  normaliserSiren,
  normaliserSiret,
  normaliserTelephoneFr,
  siretValide,
} from "@/lib/entreprise";

const ANALYSES_MAX_PAR_HEURE = 10;
const analysesRecentes = new Map<string, number[]>();

function verifierRateLimit(userId: string): boolean {
  const maintenant = Date.now();
  const fenetre = 60 * 60 * 1000;
  const liste = (analysesRecentes.get(userId) ?? []).filter((t) => maintenant - t < fenetre);
  if (liste.length >= ANALYSES_MAX_PAR_HEURE) {
    analysesRecentes.set(userId, liste);
    return false;
  }
  liste.push(maintenant);
  analysesRecentes.set(userId, liste);
  return true;
}

const TYPES_LOGO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type ResultatAnalyseSite =
  | { succes: true; profil: ExtractedCompanyProfile; champsTrouves: number }
  | { succes: false; erreur: string };

export async function analyserSiteEntreprise(urlBrute: string): Promise<ResultatAnalyseSite> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Non authentifié." };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      succes: false,
      erreur: "L'analyse automatique est temporairement indisponible. Saisissez vos informations manuellement.",
    };
  }

  if (!verifierRateLimit(session.user.id)) {
    return {
      succes: false,
      erreur: "Trop d'analyses récentes. Réessayez dans un moment, ou complétez le formulaire à la main.",
    };
  }

  const urlParsed = z.string().trim().min(3).max(500).safeParse(urlBrute);
  if (!urlParsed.success) {
    return { succes: false, erreur: "Indiquez l'adresse de votre site (ex. https://monsite.fr)." };
  }

  try {
    const { origine, pages } = await recupererPagesEntreprise(urlParsed.data);
    const indices = preparerIndicesSite(origine, pages);
    const profil = await extraireProfilDepuisIndices(indices);
    const champsTrouves = compterChampsTrouves(profil);

    if (champsTrouves === 0 && !profil.logoUrl.value) {
      return {
        succes: false,
        erreur:
          "Nous n'avons pas trouvé d'informations exploitables sur ce site. Vous pouvez saisir vos informations manuellement.",
      };
    }

    return { succes: true, profil, champsTrouves };
  } catch (e) {
    if (e instanceof FetchSiteError) {
      const messages: Record<string, string> = {
        url_invalide: "L'adresse du site n'est pas valide. Vérifiez le format (ex. https://monsite.fr).",
        protocole_interdit: "Seuls les sites en http:// ou https:// sont acceptés.",
        hote_interdit: "Cette adresse ne peut pas être analysée.",
        inaccessible: "Nous n'avons pas réussi à accéder à ce site. Vérifiez l'adresse ou saisissez vos infos à la main.",
        timeout: "Le site met trop de temps à répondre. Réessayez plus tard, ou saisissez vos informations manuellement.",
        trop_volumineux: "La page est trop volumineuse pour être analysée. Saisissez vos informations manuellement.",
        erreur_reseau: "Nous n'avons pas réussi à analyser ce site. Vous pouvez saisir vos informations manuellement.",
      };
      return { succes: false, erreur: messages[e.code] ?? messages.erreur_reseau };
    }
    console.error("Analyse site entreprise :", e);
    return {
      succes: false,
      erreur: "Nous n'avons pas réussi à analyser ce site. Vous pouvez saisir vos informations manuellement.",
    };
  }
}

async function telechargerEtStockerLogo(userId: string, logoUrl: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { buffer, contentType } = await fetchBinaireSecurise(logoUrl);
    if (buffer.byteLength === 0 || buffer.byteLength > 5 * 1024 * 1024) return null;

    const typeDetecte = await fileTypeFromBuffer(buffer);
    const mime = typeDetecte?.mime ?? (contentType.startsWith("image/") ? contentType.split(";")[0].trim() : null);
    if (!mime) return null;
    const extension = TYPES_LOGO[mime];
    if (!extension) return null;

    const cleStockage = `logos/${userId}.${extension}`;
    const { error } = await getSupabaseAdmin().storage
      .from(DOCUMENTS_BUCKET)
      .upload(cleStockage, buffer, { contentType: mime, upsert: true });
    if (error) {
      console.error("Stockage logo depuis site :", error);
      return null;
    }
    return cleStockage;
  } catch (e) {
    console.error("Téléchargement logo site :", e);
    return null;
  }
}

const schemaApplication = z.object({
  raisonSociale: z.string().trim().min(1).max(200),
  nomCommercial: z.string().trim().max(200).optional().nullable(),
  siret: z.string().trim().refine(siretValide, "SIRET invalide."),
  siren: z.string().trim().optional().nullable(),
  formeJuridique: z.string().trim().max(80).optional().nullable(),
  adresseRue: z.string().trim().min(1).max(300),
  adresseCodePostal: z.string().trim().min(1).max(20),
  adresseVille: z.string().trim().min(1).max(120),
  telephone: z.string().trim().min(1).max(40),
  emailContact: z.string().trim().email(),
  website: z.string().trim().max(500).optional().nullable(),
  numeroTva: z.string().trim().max(30).optional().nullable(),
  iban: z.string().trim().max(40).optional().nullable(),
  capitalSocial: z.string().trim().max(80).optional().nullable(),
  registreImmatriculation: z.string().trim().max(200).optional().nullable(),
  activite: z.string().trim().max(200).optional().nullable(),
  activiteDescription: z.string().trim().max(2000).optional().nullable(),
  couleurPrimaire: z.string().trim().max(7).optional().nullable(),
  couleurSecondaire: z.string().trim().max(7).optional().nullable(),
  conditionsPaiementDefaut: z.string().trim().max(2000).optional().nullable(),
  mentionsLegales: z.string().trim().max(4000).optional().nullable(),
  logoUrl: z.string().trim().max(2000).optional().nullable(),
  regimeTva: z.enum(["NORMAL", "FRANCHISE_293B"]).optional(),
});

export type DonneesApplicationProfil = z.input<typeof schemaApplication>;

export type ResultatApplicationProfil = { succes: true } | { succes: false; erreur: string };

function vide(valeur: string | null | undefined): string | null {
  return valeur && valeur.trim().length > 0 ? valeur.trim() : null;
}

/**
 * Enregistre le profil après validation explicite par l'artisan.
 * Ne fait confiance à aucune valeur sans re-validation serveur.
 */
export async function appliquerProfilExtrait(donnees: DonneesApplicationProfil): Promise<ResultatApplicationProfil> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Non authentifié." };
  }
  const userId = session.user.id;

  const parsed = schemaApplication.safeParse(donnees);
  if (!parsed.success) {
    return { succes: false, erreur: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  const data = parsed.data;

  const siret = normaliserSiret(data.siret);
  if (!siret) return { succes: false, erreur: "SIRET invalide (14 chiffres attendus)." };

  const telephone = normaliserTelephoneFr(data.telephone) ?? data.telephone.trim();
  const emailContact = normaliserEmail(data.emailContact);
  if (!emailContact) return { succes: false, erreur: "Adresse email invalide." };

  const numeroTva = normaliserNumeroTva(data.numeroTva ?? null);
  const iban = normaliserIban(data.iban ?? null);
  const siren = normaliserSiren(data.siren ?? null) ?? siret.slice(0, 9);
  const couleurPrimaire = normaliserCouleurHex(data.couleurPrimaire ?? null);
  const couleurSecondaire = normaliserCouleurHex(data.couleurSecondaire ?? null);

  let logoKey: string | undefined;
  if (data.logoUrl && data.logoUrl.startsWith("http")) {
    const cle = await telechargerEtStockerLogo(userId, data.logoUrl);
    if (cle) logoKey = cle;
  }

  const existant = await prisma.companyProfile.findUnique({ where: { userId } });

  const payload = {
    raisonSociale: data.raisonSociale,
    nomCommercial: vide(data.nomCommercial),
    siret,
    siren,
    formeJuridique: vide(data.formeJuridique),
    adresseRue: data.adresseRue,
    adresseCodePostal: data.adresseCodePostal,
    adresseVille: data.adresseVille,
    telephone,
    emailContact,
    website: vide(data.website) || null,
    numeroTva,
    iban,
    capitalSocial: vide(data.capitalSocial),
    registreImmatriculation: vide(data.registreImmatriculation),
    activite: vide(data.activite),
    activiteDescription: vide(data.activiteDescription),
    couleurPrimaire,
    couleurSecondaire,
    conditionsPaiementDefaut: vide(data.conditionsPaiementDefaut),
    mentionsLegales: vide(data.mentionsLegales),
    regimeTva: data.regimeTva ?? existant?.regimeTva ?? "NORMAL",
    ...(logoKey ? { logoKey } : {}),
  };

  await prisma.companyProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...payload,
      margeParDefautPct: existant?.margeParDefautPct ?? 25,
    },
    update: payload,
  });

  return { succes: true };
}
