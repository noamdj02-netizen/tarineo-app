"use server";

import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin } from "@/lib/supabase";
import { siretValide } from "@/lib/entreprise";

const TAILLE_MAX_LOGO_OCTETS = 5 * 1024 * 1024; // 5 Mo — largement suffisant pour un logo
const TYPES_LOGO_AUTORISES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type ErreurUploadLogo = "trop_volumineux" | "type_invalide" | "erreur";

// Vérifie le type réel par magic bytes (jamais par l'extension/Content-Type fournis par
// le navigateur, falsifiables — même garde-fou que src/lib/documents.ts) et remplace
// systématiquement l'éventuel logo précédent (upsert), une entreprise n'ayant qu'un seul
// logo actif. Reste ici (plutôt que dans src/lib/entreprise.ts, importé aussi par le
// formulaire client) pour ne jamais entraîner Supabase dans le bundle navigateur.
async function televerserLogo(
  userId: string,
  file: File
): Promise<{ succes: true; cleStockage: string } | { succes: false; erreur: ErreurUploadLogo }> {
  if (file.size === 0 || file.size > TAILLE_MAX_LOGO_OCTETS) {
    return { succes: false, erreur: "trop_volumineux" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const typeDetecte = await fileTypeFromBuffer(buffer);
  const extension = typeDetecte && TYPES_LOGO_AUTORISES[typeDetecte.mime];
  if (!typeDetecte || !extension) {
    return { succes: false, erreur: "type_invalide" };
  }

  const cleStockage = `logos/${userId}.${extension}`;
  const { error } = await getSupabaseAdmin().storage
    .from(DOCUMENTS_BUCKET)
    .upload(cleStockage, buffer, { contentType: typeDetecte.mime, upsert: true });

  if (error) {
    console.error("Échec de l'upload du logo vers Supabase Storage :", error);
    return { succes: false, erreur: "erreur" };
  }

  return { succes: true, cleStockage };
}

const schema = z.object({
  raisonSociale: z.string().trim().min(1, "La raison sociale est requise."),
  siret: z.string().trim().refine(siretValide, "SIRET invalide (14 chiffres attendus, clé de contrôle incorrecte)."),
  formeJuridique: z.string().trim().optional(),
  adresseRue: z.string().trim().min(1, "L'adresse est requise."),
  adresseCodePostal: z.string().trim().min(1, "Le code postal est requis."),
  adresseVille: z.string().trim().min(1, "La ville est requise."),
  telephone: z.string().trim().min(1, "Le téléphone est requis."),
  emailContact: z.string().trim().email("Adresse email invalide."),
  regimeTva: z.enum(["NORMAL", "FRANCHISE_293B"]),
  registreImmatriculation: z.string().trim().optional(),
  // Assurance décennale : entièrement optionnelle (voir prisma/schema.prisma) — pas de
  // validation "tout ou rien" ici, le PDF n'affiche le bloc que si les 5 champs sont
  // renseignés (voir assuranceComplete dans src/lib/devisPdf.tsx).
  assuranceNom: z.string().trim().optional(),
  assuranceAdresse: z.string().trim().optional(),
  assuranceNumeroContrat: z.string().trim().optional(),
  assuranceActivitesGaranties: z.string().trim().optional(),
  assuranceZoneGeographique: z.string().trim().optional(),
  // Marge appliquée par défaut aux prix suggérés dans les devis clients (voir
  // src/lib/suggestionPrix.ts) — toujours éditable ligne par ligne, jamais imposée.
  margeParDefautPct: z.coerce.number().min(0, "La marge ne peut pas être négative.").max(500, "Marge trop élevée."),
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
  }

  await prisma.companyProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      raisonSociale: data.raisonSociale,
      siret: data.siret,
      formeJuridique: vide(data.formeJuridique),
      adresseRue: data.adresseRue,
      adresseCodePostal: data.adresseCodePostal,
      adresseVille: data.adresseVille,
      telephone: data.telephone,
      emailContact: data.emailContact,
      regimeTva: data.regimeTva,
      registreImmatriculation: vide(data.registreImmatriculation),
      assuranceNom: vide(data.assuranceNom),
      assuranceAdresse: vide(data.assuranceAdresse),
      assuranceNumeroContrat: vide(data.assuranceNumeroContrat),
      assuranceActivitesGaranties: vide(data.assuranceActivitesGaranties),
      assuranceZoneGeographique: vide(data.assuranceZoneGeographique),
      margeParDefautPct: data.margeParDefautPct,
      ...(logoKey ? { logoKey } : {}),
    },
    update: {
      raisonSociale: data.raisonSociale,
      siret: data.siret,
      formeJuridique: vide(data.formeJuridique),
      adresseRue: data.adresseRue,
      adresseCodePostal: data.adresseCodePostal,
      adresseVille: data.adresseVille,
      telephone: data.telephone,
      emailContact: data.emailContact,
      regimeTva: data.regimeTva,
      registreImmatriculation: vide(data.registreImmatriculation),
      assuranceNom: vide(data.assuranceNom),
      assuranceAdresse: vide(data.assuranceAdresse),
      assuranceNumeroContrat: vide(data.assuranceNumeroContrat),
      assuranceActivitesGaranties: vide(data.assuranceActivitesGaranties),
      assuranceZoneGeographique: vide(data.assuranceZoneGeographique),
      margeParDefautPct: data.margeParDefautPct,
      ...(logoKey ? { logoKey } : {}),
    },
  });

  return { succes: true };
}
