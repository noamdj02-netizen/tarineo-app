"use server";

import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
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
import { FetchSiteError, fetchBinaireSecurise } from "@/lib/fetchSiteSecurise";

const TAILLE_MAX_LOGO_OCTETS = 5 * 1024 * 1024;
const TYPES_LOGO_AUTORISES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type ErreurUploadLogo = "trop_volumineux" | "type_invalide" | "erreur";

async function televerserLogoBuffer(
  userId: string,
  buffer: Buffer,
  mimeForce?: string
): Promise<{ succes: true; cleStockage: string } | { succes: false; erreur: ErreurUploadLogo }> {
  if (buffer.byteLength === 0 || buffer.byteLength > TAILLE_MAX_LOGO_OCTETS) {
    return { succes: false, erreur: "trop_volumineux" };
  }

  const typeDetecte = await fileTypeFromBuffer(buffer);
  const mime = typeDetecte?.mime ?? mimeForce;
  const extension = mime ? TYPES_LOGO_AUTORISES[mime] : undefined;
  if (!mime || !extension) {
    return { succes: false, erreur: "type_invalide" };
  }

  const cleStockage = `logos/${userId}.${extension}`;
  const { error } = await getSupabaseAdmin().storage
    .from(DOCUMENTS_BUCKET)
    .upload(cleStockage, buffer, { contentType: mime, upsert: true });

  if (error) {
    console.error("Échec de l'upload du logo vers Supabase Storage :", error);
    return { succes: false, erreur: "erreur" };
  }

  return { succes: true, cleStockage };
}

async function televerserLogo(
  userId: string,
  file: File
): Promise<{ succes: true; cleStockage: string } | { succes: false; erreur: ErreurUploadLogo }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return televerserLogoBuffer(userId, buffer);
}

async function televerserLogoDepuisUrl(
  userId: string,
  url: string
): Promise<{ succes: true; cleStockage: string } | { succes: false; erreur: ErreurUploadLogo }> {
  if (!isSupabaseConfigured()) return { succes: false, erreur: "erreur" };
  try {
    const { buffer, contentType } = await fetchBinaireSecurise(url);
    const mime = contentType.startsWith("image/") ? contentType.split(";")[0].trim() : undefined;
    return televerserLogoBuffer(userId, buffer, mime);
  } catch (e) {
    if (!(e instanceof FetchSiteError)) console.error("Logo URL :", e);
    return { succes: false, erreur: "erreur" };
  }
}

const schema = z.object({
  raisonSociale: z.string().trim().min(1, "La raison sociale est requise."),
  nomCommercial: z.string().trim().optional(),
  siret: z.string().trim().refine(siretValide, "SIRET invalide (14 chiffres attendus, clé de contrôle incorrecte)."),
  formeJuridique: z.string().trim().optional(),
  adresseRue: z.string().trim().min(1, "L'adresse est requise."),
  adresseCodePostal: z.string().trim().min(1, "Le code postal est requis."),
  adresseVille: z.string().trim().min(1, "La ville est requise."),
  telephone: z.string().trim().min(1, "Le téléphone est requis."),
  emailContact: z.string().trim().email("Adresse email invalide."),
  website: z.string().trim().optional(),
  numeroTva: z.string().trim().optional(),
  iban: z.string().trim().optional(),
  capitalSocial: z.string().trim().optional(),
  activite: z.string().trim().optional(),
  activiteDescription: z.string().trim().optional(),
  couleurPrimaire: z.string().trim().optional(),
  couleurSecondaire: z.string().trim().optional(),
  conditionsPaiementDefaut: z.string().trim().optional(),
  mentionsLegales: z.string().trim().optional(),
  regimeTva: z.enum(["NORMAL", "FRANCHISE_293B"]),
  registreImmatriculation: z.string().trim().optional(),
  assuranceNom: z.string().trim().optional(),
  assuranceAdresse: z.string().trim().optional(),
  assuranceNumeroContrat: z.string().trim().optional(),
  assuranceActivitesGaranties: z.string().trim().optional(),
  assuranceZoneGeographique: z.string().trim().optional(),
  margeParDefautPct: z.coerce.number().min(0, "La marge ne peut pas être négative.").max(500, "Marge trop élevée."),
  logoUrlExterne: z.string().trim().optional(),
});

export type ResultatEnregistrementEntreprise = { succes: true } | { succes: false; erreur: string };

function vide(valeur: string | undefined): string | null {
  return valeur && valeur.length > 0 ? valeur : null;
}

export async function enregistrerEntreprise(formData: FormData): Promise<ResultatEnregistrementEntreprise> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Non authentifié." };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { succes: false, erreur: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  const data = parsed.data;

  const siret = normaliserSiret(data.siret);
  if (!siret) return { succes: false, erreur: "SIRET invalide." };

  const emailContact = normaliserEmail(data.emailContact);
  if (!emailContact) return { succes: false, erreur: "Adresse email invalide." };

  const telephone = normaliserTelephoneFr(data.telephone) ?? data.telephone;
  const numeroTva = data.numeroTva ? normaliserNumeroTva(data.numeroTva) : null;
  if (data.numeroTva && data.numeroTva.trim() && !numeroTva) {
    return { succes: false, erreur: "Numéro de TVA invalide (format FR + clé + SIREN attendu)." };
  }
  const iban = data.iban ? normaliserIban(data.iban) : null;
  if (data.iban && data.iban.trim() && !iban) {
    return { succes: false, erreur: "IBAN invalide." };
  }

  let logoKey: string | undefined;
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const resultat = await televerserLogo(session.user.id, logo);
    if (!resultat.succes) {
      const messages: Record<string, string> = {
        trop_volumineux: "Le logo dépasse la taille maximale autorisée (5 Mo).",
        type_invalide: "Format de logo non reconnu (JPEG, PNG ou WebP attendus).",
        erreur: "Échec de l'envoi du logo, réessayez.",
      };
      return { succes: false, erreur: messages[resultat.erreur] };
    }
    logoKey = resultat.cleStockage;
  } else if (data.logoUrlExterne && data.logoUrlExterne.startsWith("http")) {
    const resultat = await televerserLogoDepuisUrl(session.user.id, data.logoUrlExterne);
    if (resultat.succes) {
      logoKey = resultat.cleStockage;
    }
    // Logo distant optionnel : on n'échoue pas l'enregistrement si le téléchargement rate
  }

  const payload = {
    raisonSociale: data.raisonSociale,
    nomCommercial: vide(data.nomCommercial),
    siret,
    siren: normaliserSiren(siret),
    formeJuridique: vide(data.formeJuridique),
    adresseRue: data.adresseRue,
    adresseCodePostal: data.adresseCodePostal,
    adresseVille: data.adresseVille,
    telephone,
    emailContact,
    website: vide(data.website),
    numeroTva,
    iban,
    capitalSocial: vide(data.capitalSocial),
    activite: vide(data.activite),
    activiteDescription: vide(data.activiteDescription),
    couleurPrimaire: normaliserCouleurHex(data.couleurPrimaire),
    couleurSecondaire: normaliserCouleurHex(data.couleurSecondaire),
    conditionsPaiementDefaut: vide(data.conditionsPaiementDefaut),
    mentionsLegales: vide(data.mentionsLegales),
    regimeTva: data.regimeTva,
    registreImmatriculation: vide(data.registreImmatriculation),
    assuranceNom: vide(data.assuranceNom),
    assuranceAdresse: vide(data.assuranceAdresse),
    assuranceNumeroContrat: vide(data.assuranceNumeroContrat),
    assuranceActivitesGaranties: vide(data.assuranceActivitesGaranties),
    assuranceZoneGeographique: vide(data.assuranceZoneGeographique),
    margeParDefautPct: data.margeParDefautPct,
    ...(logoKey ? { logoKey } : {}),
  };

  await prisma.companyProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      ...payload,
    },
    update: payload,
  });

  return { succes: true };
}
