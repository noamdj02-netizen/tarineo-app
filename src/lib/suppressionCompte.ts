import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { supprimerFichiersUtilisateur } from "@/lib/stockageUtilisateur";

/**
 * Suppression RGPD complète : Stripe → fichiers → base.
 * Les cascades Prisma effacent le reste (documents, lignes, alertes, etc.).
 */
export async function supprimerCompteUtilisateur(userId: string): Promise<void> {
  const utilisateur = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeSubscriptionId: true, stripeCustomerId: true },
  });

  if (!utilisateur) return;

  if (utilisateur.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(utilisateur.stripeSubscriptionId);
    } catch (erreur) {
      console.error("Annulation abonnement Stripe à la suppression :", erreur);
    }
  }

  if (utilisateur.stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
    try {
      await stripe.customers.del(utilisateur.stripeCustomerId);
    } catch (erreur) {
      console.error("Suppression client Stripe :", erreur);
    }
  }

  await supprimerFichiersUtilisateur(userId);
  await prisma.user.delete({ where: { id: userId } });
}
