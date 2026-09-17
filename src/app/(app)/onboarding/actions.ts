"use server";

import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculerResumeAnalyse, completerOnboardingFlow } from "@/lib/onboarding";
import { DOCUMENTS_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const TYPES_LOGO = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

async function televerserLogoDepuisUrl(userId: string, url: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > 5 * 1024 * 1024) return null;
    const typeDetecte = await fileTypeFromBuffer(buffer);
    const extension = typeDetecte && TYPES_LOGO[typeDetecte.mime as keyof typeof TYPES_LOGO];
    if (!typeDetecte || !extension) return null;
    const cleStockage = `logos/${userId}.${extension}`;
    const { error } = await getSupabaseAdmin().storage
      .from(DOCUMENTS_BUCKET)
      .upload(cleStockage, buffer, { contentType: typeDetecte.mime, upsert: true });
    return error ? null : cleStockage;
  } catch {
    return null;
  }
}

export async function choisirImportMaintenant() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingImportDeferred: false },
  });

  redirect("/documents?onboarding=1");
}

export async function choisirImportPlusTard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      onboardingImportDeferred: true,
      // Pas encore "terminé" : on garde la bannière de reprise jusqu'au 1er import
    },
  });

  redirect("/onboarding/plus-tard");
}

export async function marquerOnboardingTermine() {
  const session = await auth();
  if (!session?.user?.id) return;

  await completerOnboardingFlow(session.user.id);
  revalidatePath("/accueil");
}

export async function accederEspaceApresPlusTard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  redirect("/accueil");
}

export async function chargerResumeOnboarding() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return calculerResumeAnalyse(session.user.id);
}

const schemaEntrepriseOnboarding = z.object({
  raisonSociale: z.string().trim().min(1, "Le nom de l'entreprise est requis."),
  telephone: z.string().trim().optional(),
  emailContact: z.string().trim().email(),
  logoUrl: z.string().url().optional(),
});

export async function enregistrerEntrepriseOnboarding(
  formData: FormData
): Promise<{ succes: true } | { succes: false; erreur: string }> {
  const session = await auth();
  if (!session?.user?.id) return { succes: false, erreur: "Non authentifié." };

  const parsed = schemaEntrepriseOnboarding.safeParse({
    raisonSociale: formData.get("raisonSociale"),
    telephone: formData.get("telephone"),
    emailContact: formData.get("emailContact"),
    logoUrl: formData.get("logoUrl") || undefined,
  });
  if (!parsed.success) {
    return { succes: false, erreur: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }

  let logoKey: string | undefined;
  const logoUrl = parsed.data.logoUrl;
  if (logoUrl) {
    const cle = await televerserLogoDepuisUrl(session.user.id, logoUrl);
    if (cle) logoKey = cle;
  }
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0 && isSupabaseConfigured()) {
    const buffer = Buffer.from(await logo.arrayBuffer());
    const typeDetecte = await fileTypeFromBuffer(buffer);
    const extension = typeDetecte && TYPES_LOGO[typeDetecte.mime as keyof typeof TYPES_LOGO];
    if (typeDetecte && extension) {
      const cleStockage = `logos/${session.user.id}.${extension}`;
      const { error } = await getSupabaseAdmin().storage
        .from(DOCUMENTS_BUCKET)
        .upload(cleStockage, buffer, { contentType: typeDetecte.mime, upsert: true });
      if (!error) logoKey = cleStockage;
    }
  }

  await prisma.companyProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      raisonSociale: parsed.data.raisonSociale,
      siret: "",
      adresseRue: "—",
      adresseCodePostal: "00000",
      adresseVille: "—",
      telephone: parsed.data.telephone || "—",
      emailContact: parsed.data.emailContact,
      ...(logoKey ? { logoKey } : {}),
    },
    update: {
      raisonSociale: parsed.data.raisonSociale,
      telephone: parsed.data.telephone || "—",
      emailContact: parsed.data.emailContact,
      ...(logoKey ? { logoKey } : {}),
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { entrepriseNom: parsed.data.raisonSociale },
  });

  return { succes: true };
}

export async function terminerOnboardingEtAllerDashboard() {
  const session = await auth();
  if (!session?.user?.id) return;
  await completerOnboardingFlow(session.user.id);
  revalidatePath("/accueil");
}
