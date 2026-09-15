"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasherMotDePasse, verifierMotDePasse, LONGUEUR_MIN_MOT_DE_PASSE } from "@/lib/password";
import { stripe } from "@/lib/stripe";
import { envoyerEmailResiliationAbonnement } from "@/lib/email";

export type ResultatAction = { succes: true; message: string } | { succes: false; erreur: string };

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
