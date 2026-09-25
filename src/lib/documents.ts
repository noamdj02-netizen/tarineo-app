import { fileTypeFromBuffer } from "file-type";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { DocumentType } from "@prisma/client";

const TAILLE_MAX_OCTETS = 20 * 1024 * 1024; // 20 Mo — marge pour les photos de facture haute résolution

// Allow-list des types réellement acceptés, vérifiée par magic bytes (jamais par
// l'extension ou le Content-Type fourni par le navigateur, qui sont falsifiables).
const TYPES_AUTORISES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/heic": "heic",
  "image/heif": "heic",
};

export type ErreurEnregistrementDocument =
  | "trop_volumineux"
  | "type_invalide"
  | "quota_depasse"
  | "essai_termine"
  | "stockage_indisponible"
  | "base_indisponible"
  | "erreur";

export type ResultatEnregistrementDocument =
  | { succes: true; documentId: string }
  | { succes: false; erreur: ErreurEnregistrementDocument };

export interface DoublonPotentiel {
  documentId: string;
  distributor: string | null;
  documentDate: Date | null;
  totalTtc: number | null;
  envoyeLe: Date;
}

export function calculerHashFichier(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

// Détection forte : même utilisateur, mêmes octets exacts déjà envoyés (ré-upload du
// même fichier, par erreur ou par double-tap). Ne couvre pas le cas d'un même achat
// re-scanné/re-photographié sous un fichier différent — voir le repli sur empreinte
// (distributeur + date + montant) fait après extraction dans analyserDocument.
export async function trouverDoublonParHash(userId: string, fileHash: string): Promise<DoublonPotentiel | null> {
  const doublon = await prisma.document.findFirst({
    where: { userId, fileHash },
    select: { id: true, distributor: true, documentDate: true, totalTtc: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  if (!doublon) return null;
  return {
    documentId: doublon.id,
    distributor: doublon.distributor,
    documentDate: doublon.documentDate,
    totalTtc: doublon.totalTtc !== null ? Number(doublon.totalTtc) : null,
    envoyeLe: doublon.createdAt,
  };
}

async function detecterTypeFichier(buffer: Buffer): Promise<{ mime: string; extension: string } | null> {
  const typeDetecte = await fileTypeFromBuffer(buffer);
  if (typeDetecte && TYPES_AUTORISES[typeDetecte.mime]) {
    return { mime: typeDetecte.mime, extension: TYPES_AUTORISES[typeDetecte.mime] };
  }

  // Repli pour photos iPhone / exports où file-type ne reconnaît pas toujours le MIME.
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", extension: "jpg" };
  }
  if (buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { mime: "image/png", extension: "png" };
  }
  if (buffer.length >= 4 && buffer.subarray(0, 4).toString("ascii") === "%PDF") {
    return { mime: "application/pdf", extension: "pdf" };
  }

  return null;
}

export const DUREE_BROUILLON_DOUBLON_JOURS = 4;

export type OptionsEnregistrementDocument = {
  /** Ré-import du même fichier (hash) : brouillon temporaire avant conservation. */
  brouillonDoublon?: boolean;
};

export async function enregistrerDocument(
  userId: string,
  type: DocumentType,
  buffer: Buffer,
  fileHash: string,
  options: OptionsEnregistrementDocument = {},
): Promise<ResultatEnregistrementDocument> {
  // Vérifié avant de lire le fichier : sans cette garde, getSupabaseAdmin() lève et la
  // page entière plante au lieu d'afficher l'erreur dans le formulaire. Cas typique
  // d'une variable d'environnement oubliée après un déploiement.
  if (!isSupabaseConfigured()) {
    console.error("Upload impossible : SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY absents de l'environnement.");
    return { succes: false, erreur: "stockage_indisponible" };
  }

  if (buffer.length === 0 || buffer.length > TAILLE_MAX_OCTETS) {
    return { succes: false, erreur: "trop_volumineux" };
  }

  const typeFichier = await detecterTypeFichier(buffer);
  if (!typeFichier) {
    return { succes: false, erreur: "type_invalide" };
  }

  const cleStockage = `${userId}/${crypto.randomUUID()}.${typeFichier.extension}`;

  const { error: erreurUpload } = await getSupabaseAdmin().storage
    .from(DOCUMENTS_BUCKET)
    .upload(cleStockage, buffer, {
      contentType: typeFichier.mime,
      upsert: false,
    });

  if (erreurUpload) {
    console.error("Échec de l'upload vers Supabase Storage :", erreurUpload);
    return { succes: false, erreur: "stockage_indisponible" };
  }

  const brouillonExpireAt =
    options.brouillonDoublon === true
      ? new Date(Date.now() + DUREE_BROUILLON_DOUBLON_JOURS * 24 * 60 * 60 * 1000)
      : null;

  try {
    const document = await prisma.document.create({
      data: {
        userId,
        type,
        fileKey: cleStockage,
        fileHash,
        status: "PROCESSING",
        brouillonExpireAt,
      },
    });

    return { succes: true, documentId: document.id };
  } catch (erreur) {
    console.error("Échec de la création Document en base :", erreur);
    await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).remove([cleStockage]);
    return { succes: false, erreur: "base_indisponible" };
  }
}
