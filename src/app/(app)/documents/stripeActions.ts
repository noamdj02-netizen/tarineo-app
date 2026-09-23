"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { type PlanStripe, PLANS_STRIPE } from "@/lib/plansStripe";
import { stripe, PRIX_MENSUEL_PAR_PLAN } from "@/lib/stripe";

export type PlanValide = PlanStripe;

export type ResultatSetupIntent = { succes: true; clientSecret: string } | { succes: false; erreur: string };

// Prépare l'enregistrement d'une carte bancaire via un SetupIntent Stripe — capture
// le moyen de paiement sans aucun prélèvement. Le plan choisi est stocké dans les
// métadonnées du SetupIntent : c'est le webhook (setup_intent.succeeded, voir
// src/app/api/stripe/webhook/route.ts), pas ce code, qui active le compte une fois
// la carte réellement enregistrée côté Stripe.
export async function creerSetupIntentPaiement(plan: string): Promise<ResultatSetupIntent> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Vous devez être connecté." };
  }
  if (!PLANS_STRIPE.includes(plan as PlanValide)) {
    return { succes: false, erreur: "Plan invalide." };
  }

  const utilisateur = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true, email: true },
  });
  if (!utilisateur) {
    return { succes: false, erreur: "Compte introuvable." };
  }

  let customerId = utilisateur.stripeCustomerId;
  if (!customerId) {
    const client = await stripe.customers.create({
      email: utilisateur.email ?? undefined,
      metadata: { userId: session.user.id },
    });
    customerId = client.id;
    await prisma.user.update({ where: { id: session.user.id }, data: { stripeCustomerId: customerId } });
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
    metadata: { userId: session.user.id, plan },
  });

  if (!setupIntent.client_secret) {
    return { succes: false, erreur: "Impossible de préparer l'enregistrement de la carte." };
  }

  return { succes: true, clientSecret: setupIntent.client_secret };
}

// Le formulaire client interroge cette action après confirmation du SetupIntent
// côté Stripe, en attendant que le webhook (asynchrone) ait mis à jour le compte —
// évite de débloquer l'écran sur la seule foi de la confirmation client.
export type ResultatChangementPlan =
  | { succes: true }
  | { succes: false; erreur: string; besoinPaiement?: boolean };

/** Change de formule pour un abonné actif (prorata Stripe, sans quitter l'app). */
export async function changerPlanAbonnement(plan: string): Promise<ResultatChangementPlan> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Vous devez être connecté." };
  }
  if (!PLANS_STRIPE.includes(plan as PlanValide)) {
    return { succes: false, erreur: "Plan invalide." };
  }

  const priceId = PRIX_MENSUEL_PAR_PLAN[plan];
  if (!priceId) {
    return { succes: false, erreur: "Prix Stripe non configuré pour ce plan." };
  }

  const utilisateur = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, stripeSubscriptionId: true },
  });
  if (!utilisateur) {
    return { succes: false, erreur: "Compte introuvable." };
  }
  if (!utilisateur.stripeSubscriptionId) {
    return { succes: false, erreur: "Aucun abonnement actif.", besoinPaiement: true };
  }
  if (utilisateur.plan === plan) {
    return { succes: true };
  }

  try {
    const abonnement = await stripe.subscriptions.retrieve(utilisateur.stripeSubscriptionId);
    const itemId = abonnement.items.data[0]?.id;
    if (!itemId) {
      return { succes: false, erreur: "Abonnement Stripe invalide." };
    }

    await stripe.subscriptions.update(utilisateur.stripeSubscriptionId, {
      items: [{ id: itemId, price: priceId }],
      proration_behavior: "create_prorations",
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { plan },
    });

    return { succes: true };
  } catch (erreur) {
    console.error("changerPlanAbonnement:", erreur);
    return {
      succes: false,
      erreur: "Impossible de changer de plan. Vérifiez votre moyen de paiement.",
      besoinPaiement: true,
    };
  }
}

export async function verifierActivationCompte(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  const utilisateur = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionStatus: true },
  });
  return utilisateur?.subscriptionStatus === "active";
}
