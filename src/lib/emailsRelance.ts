import { prisma } from "@/lib/prisma";
import { DUREE_ESSAI_MOIS } from "@/lib/quota";
import { parserPayloadsAlertesHausse } from "@/lib/comparaisonPrix";
import {
  envoyerEmailPaiementEchoue,
  envoyerEmailEssaiBientotTermine,
  envoyerEmailResumeHausses,
} from "@/lib/email";
import { origineActuelle } from "@/lib/origine";

function ajouterMois(date: Date, mois: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + mois, date.getUTCDate()));
}

/** Relances transactionnelles : essai, hausses non vues, paiement échoué (appel cron ou webhook). */
export async function envoyerRelancesUtilisateur(userId: string): Promise<void> {
  const utilisateur = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      createdAt: true,
      subscriptionStatus: true,
      trialReminderEmailSentAt: true,
      haussesDigestEmailSentAt: true,
    },
  });
  if (!utilisateur?.email) return;

  const origine = await origineActuelle();
  const prenom = (utilisateur.name?.split(" ")[0] ?? "Artisan").replace(/^./, (c) => c.toUpperCase());
  const maintenant = new Date();
  const finEssai = ajouterMois(utilisateur.createdAt, DUREE_ESSAI_MOIS);
  const joursRestants = Math.ceil((finEssai.getTime() - maintenant.getTime()) / 86400000);

  if (
    utilisateur.subscriptionStatus === "trialing" &&
    joursRestants > 0 &&
    joursRestants <= 7 &&
    !utilisateur.trialReminderEmailSentAt
  ) {
    await envoyerEmailEssaiBientotTermine(utilisateur.email, {
      prenom,
      joursRestants,
      urlForfaits: `${origine}/parametres?onglet=abonnement`,
      origine,
    });
    await prisma.user.update({
      where: { id: userId },
      data: { trialReminderEmailSentAt: maintenant },
    });
  }

  const alertesNonVues = await prisma.alert.findMany({
    where: { userId, type: "PRICE_INCREASE", seenAt: null },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { payload: true, createdAt: true },
  });

  const dernierDigest = utilisateur.haussesDigestEmailSentAt;
  const digestRecent = dernierDigest && maintenant.getTime() - dernierDigest.getTime() < 7 * 86400000;

  if (alertesNonVues.length >= 3 && !digestRecent) {
    const payloads = parserPayloadsAlertesHausse(alertesNonVues);
    await envoyerEmailResumeHausses(utilisateur.email, {
      prenom,
      nombreHausses: payloads.length,
      urlDocuments: `${origine}/documents?hausse=1`,
      origine,
    });
    await prisma.user.update({
      where: { id: userId },
      data: { haussesDigestEmailSentAt: maintenant },
    });
  }
}

export async function envoyerEmailPaiementEchouePourClient(customerId: string): Promise<void> {
  const utilisateur = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true, email: true, name: true, paymentFailedEmailSentAt: true },
  });
  if (!utilisateur?.email) return;

  const maintenant = new Date();
  if (
    utilisateur.paymentFailedEmailSentAt &&
    maintenant.getTime() - utilisateur.paymentFailedEmailSentAt.getTime() < 24 * 3600000
  ) {
    return;
  }

  const origine = await origineActuelle();
  const prenom = (utilisateur.name?.split(" ")[0] ?? "Artisan").replace(/^./, (c) => c.toUpperCase());

  await envoyerEmailPaiementEchoue(utilisateur.email, {
    prenom,
    urlPortail: `${origine}/parametres?onglet=abonnement`,
    origine,
  });

  await prisma.user.update({
    where: { id: utilisateur.id },
    data: { paymentFailedEmailSentAt: maintenant },
  });
}
