import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, PRIX_MENSUEL_PAR_PLAN } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Confirmation asynchrone de l'enregistrement d'une carte (voir
// src/app/(app)/documents/stripeActions.ts pour la création du SetupIntent) :
// c'est ce webhook, pas la confirmation côté navigateur, qui fait foi pour
// débloquer le compte — la métadonnée `plan` posée à la création du SetupIntent
// indique la formule choisie par l'artisan.
export async function POST(request: NextRequest) {
  const corpsBrut = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ erreur: "Signature manquante." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(corpsBrut, signature, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch (erreur) {
    console.error("Signature webhook Stripe invalide :", erreur);
    return NextResponse.json({ erreur: "Signature invalide." }, { status: 400 });
  }

  if (event.type === "setup_intent.succeeded") {
    const setupIntent = event.data.object;
    const userId = setupIntent.metadata?.userId;
    const plan = setupIntent.metadata?.plan;

    const priceId = plan ? PRIX_MENSUEL_PAR_PLAN[plan] : undefined;

    if (userId && plan && priceId) {
      const paymentMethodId =
        typeof setupIntent.payment_method === "string" ? setupIntent.payment_method : setupIntent.payment_method?.id;
      const customerId = typeof setupIntent.customer === "string" ? setupIntent.customer : setupIntent.customer?.id;

      if (customerId && paymentMethodId) {
        await stripe.customers.update(customerId, {
          invoice_settings: { default_payment_method: paymentMethodId },
        });

        // Abonnement mensuel réel (pas de période d'essai Stripe : l'essai gratuit
        // est déjà géré côté Tarineo avant même l'ajout d'une carte, voir
        // src/lib/quota.ts) — c'est cet abonnement que la page "Mon compte" permet
        // ensuite de résilier.
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          default_payment_method: paymentMethodId,
        });

        await prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: "active", plan, stripeSubscriptionId: subscription.id },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
