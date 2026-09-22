"use server";

import { z } from "zod";
import { fileTypeFromBuffer } from "file-type";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasherMotDePasse, verifierMotDePasse, LONGUEUR_MIN_MOT_DE_PASSE } from "@/lib/password";
import { stripe } from "@/lib/stripe";
import { envoyerEmailResiliationAbonnement } from "@/lib/email";
import { supprimerCompteUtilisateur } from "@/lib/suppressionCompte";
import { estCleStockageAvatar } from "@/lib/avatarUtilisateur";
import { DOCUMENTS_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";

export type ResultatAction = { succes: true; message: string } | { succes: false; erreur: string };

const TAILLE_MAX_PHOTO_OCTETS = 5 * 1024 * 1024;
const TYPES_PHOTO_AUTORISES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function televerserPhoto(
  userId: string,
  file: File,
): Promise<{ succes: true; cleStockage: string } | { succes: false; erreur: string }> {
  if (!isSupabaseConfigured()) {
    return { succes: false, erreur: "Stockage indisponible. Réessayez plus tard." };
  }
  if (file.size === 0 || file.size > TAILLE_MAX_PHOTO_OCTETS) {
    return { succes: false, erreur: "La photo dépasse 5 Mo." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const typeDetecte = await fileTypeFromBuffer(buffer);
  const extension = typeDetecte && TYPES_PHOTO_AUTORISES[typeDetecte.mime];
  if (!typeDetecte || !extension) {
    return { succes: false, erreur: "Format non reconnu (JPEG, PNG ou WebP)." };
  }

  const cleStockage = `avatars/${userId}.${extension}`;
  const { error } = await getSupabaseAdmin().storage
    .from(DOCUMENTS_BUCKET)
    .upload(cleStockage, buffer, { contentType: typeDetecte.mime, upsert: true });

  if (error) {
    console.error("Échec upload photo de profil :", error);
    return { succes: false, erreur: "Échec de l'envoi, réessayez." };
  }

  return { succes: true, cleStockage };
}

export async function televerserPhotoProfil(formData: FormData): Promise<ResultatAction> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Vous devez être connecté." };
  }

  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return { succes: false, erreur: "Sélectionnez une photo." };
  }

  const resultat = await televerserPhoto(session.user.id, photo);
  if (!resultat.succes) {
    return { succes: false, erreur: resultat.erreur };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: resultat.cleStockage },
  });

  return { succes: true, message: "Photo de profil mise à jour." };
}

export async function supprimerPhotoProfil(): Promise<ResultatAction> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Vous devez être connecté." };
  }

  const utilisateur = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  if (utilisateur?.image && estCleStockageAvatar(utilisateur.image) && isSupabaseConfigured()) {
    await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).remove([utilisateur.image]);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: null },
  });

  return { succes: true, message: "Photo de profil supprimée." };
}

const schemaMotDePasse = z
  .object({
    ancien: z.string().min(1, "Mot de passe actuel requis."),
    nouveau: z.string().min(LONGUEUR_MIN_MOT_DE_PASSE, `Le nouveau mot de passe doit faire au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`),
    confirmation: z.string(),
  })
  .refine((d) => d.nouveau === d.confirmation, {
    message: "La confirmation ne correspond pas au nouveau mot de passe.",
    path: ["confirmation"],
  });

// Réservé aux comptes email/mot de passe (voir FormulaireMotDePasse.tsx, masqué côté
// UI quand passwordHash est vide — un compte Google n'en a jamais eu) ; revérifié ici
// côté serveur pour ne pas dépendre uniquement de l'affichage.
export async function changerMotDePasse(formData: FormData): Promise<ResultatAction> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Vous devez être connecté." };
  }

  const parsed = schemaMotDePasse.safeParse({
    ancien: formData.get("ancien"),
    nouveau: formData.get("nouveau"),
    confirmation: formData.get("confirmation"),
  });
  if (!parsed.success) {
    return { succes: false, erreur: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const utilisateur = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!utilisateur?.passwordHash) {
    return { succes: false, erreur: "Ce compte n'a pas de mot de passe local à changer." };
  }

  const ancienValide = await verifierMotDePasse(parsed.data.ancien, utilisateur.passwordHash);
  if (!ancienValide) {
    return { succes: false, erreur: "Mot de passe actuel incorrect." };
  }

  const nouveauHash = await hasherMotDePasse(parsed.data.nouveau);
  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: nouveauHash } });

  return { succes: true, message: "Mot de passe mis à jour." };
}

// Utilisé aussi bien pour "Résilier mon abonnement" (mensuel) que pour "Désactiver
// le renouvellement automatique" (annuel) : dans les deux cas, Stripe n'expose qu'un
// seul mécanisme — cancel_at_period_end — qui laisse l'abonnement courir jusqu'à la
// fin de la période déjà payée sans la renouveler ensuite. La distinction entre les
// deux n'est que le message affiché à l'artisan (voir GestionAbonnement.tsx) : aucun
// remboursement au prorata, aucune coupure d'accès avant cette date dans les deux cas.
export async function resilierAbonnement(): Promise<ResultatAction> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { succes: false, erreur: "Vous devez être connecté." };
  }

  const utilisateur = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeSubscriptionId: true, email: true },
  });
  if (!utilisateur?.stripeSubscriptionId) {
    return { succes: false, erreur: "Aucun abonnement actif à résilier." };
  }

  const subscription = await stripe.subscriptions.update(utilisateur.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  const finPeriode = subscription.items.data[0]?.current_period_end;
  const dateFin = finPeriode
    ? new Date(finPeriode * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "la fin de la période en cours";

  // La résiliation Stripe (ci-dessus) a déjà réussi à ce stade : un échec d'envoi
  // d'email ne doit pas la faire remonter comme un échec côté artisan, qui verrait
  // alors une erreur alors que son abonnement est bel et bien programmé pour
  // s'arrêter. On journalise l'échec sans le propager.
  let emailEnvoye = true;
  try {
    await envoyerEmailResiliationAbonnement(utilisateur.email, dateFin);
  } catch (erreur) {
    emailEnvoye = false;
    console.error("Résiliation confirmée mais email de confirmation non envoyé :", erreur);
  }

  return {
    succes: true,
    message: emailEnvoye
      ? `Confirmé — accès conservé jusqu'au ${dateFin}. Un email de confirmation vous a été envoyé.`
      : `Confirmé — accès conservé jusqu'au ${dateFin}. (L'email de confirmation n'a pas pu être envoyé.)`,
  };
}

export async function supprimerMonCompte(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion");
  }

  await supprimerCompteUtilisateur(session.user.id);
  await signOut({ redirectTo: "/" });
}
