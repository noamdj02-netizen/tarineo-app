import convertHeic from "heic-convert";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export type ZoneLogoDocument = {
  x_pct: number;
  y_pct: number;
  width_pct: number;
  height_pct: number;
  confiance: number;
};

const SEUIL_CONFIANCE_LOGO = 0.55;
const TAILLE_LOGO_PX = 128;

function borner(valeur: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, valeur));
}

async function bufferImageExploitable(buffer: Buffer, extension: string): Promise<Buffer | null> {
  if (extension === "pdf") {
    try {
      return await sharp(buffer, { pages: 1, density: 144 }).png().toBuffer();
    } catch {
      return null;
    }
  }

  if (extension === "heic") {
    try {
      const converti = await convertHeic({ buffer, format: "JPEG", quality: 0.92 });
      return Buffer.from(converti);
    } catch {
      return null;
    }
  }

  if (extension === "png" || extension === "jpeg" || extension === "jpg") {
    return buffer;
  }

  return null;
}

/**
 * Découpe la zone du logo repérée par l'IA sur le document importé et la stocke
 * dans Supabase, une entrée par utilisateur + distributeur normalisé.
 */
export async function extraireEtEnregistrerLogoFournisseur(params: {
  userId: string;
  distributor: string;
  distributorNorm: string;
  fileBuffer: Buffer;
  extension: string;
  logoZone: ZoneLogoDocument | null | undefined;
}): Promise<void> {
  const { userId, distributor, distributorNorm, fileBuffer, extension, logoZone } = params;

  if (!isSupabaseConfigured() || !logoZone || logoZone.confiance < SEUIL_CONFIANCE_LOGO) {
    return;
  }

  if (logoZone.width_pct < 2 || logoZone.height_pct < 2) {
    return;
  }

  const source = await bufferImageExploitable(fileBuffer, extension);
  if (!source) return;

  const meta = await sharp(source).metadata();
  const largeur = meta.width ?? 0;
  const hauteur = meta.height ?? 0;
  if (largeur < 40 || hauteur < 40) return;

  const left = borner(Math.round((logoZone.x_pct / 100) * largeur), 0, largeur - 1);
  const top = borner(Math.round((logoZone.y_pct / 100) * hauteur), 0, hauteur - 1);
  const width = borner(Math.round((logoZone.width_pct / 100) * largeur), 8, largeur - left);
  const height = borner(Math.round((logoZone.height_pct / 100) * hauteur), 8, hauteur - top);

  let logoPng: Buffer;
  try {
    logoPng = await sharp(source)
      .extract({ left, top, width, height })
      .resize(TAILLE_LOGO_PX, TAILLE_LOGO_PX, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer();
  } catch (erreur) {
    console.warn("Découpe du logo fournisseur impossible :", erreur);
    return;
  }

  const cleStockage = `${userId}/fournisseurs/${distributorNorm}.png`;
  const { error } = await getSupabaseAdmin()
    .storage.from(DOCUMENTS_BUCKET)
    .upload(cleStockage, logoPng, { contentType: "image/png", upsert: true });

  if (error) {
    console.error("Échec de l'upload du logo fournisseur :", error.message);
    return;
  }

  await prisma.distributorLogo.upsert({
    where: { userId_distributorNorm: { userId, distributorNorm } },
    create: {
      userId,
      distributorNorm,
      distributor,
      logoKey: cleStockage,
    },
    update: {
      distributor,
      logoKey: cleStockage,
    },
  });
}
