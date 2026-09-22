import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { stripe, PRIX_MENSUEL_PAR_PLAN, planDepuisPriceId } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { envoyerEmailPaiementEchouePourClient } from "@/lib/emailsRelance";

async function evenementDejaTraite(eventId: string): Promise<boolean> {
  const existant = await prisma.stripeWebhookEvent.findUnique({
    where: { eventId },
    select: { eventId: true },
  });
  return existant !== null;
}

async function marquerEvenementTraite(eventId: string, eventType: string): Promise<void> {
  try {
    await prisma.stripeWebhookEvent.create({
      data: { eventId, eventType },
    });
  } catch (erreur) {
    if (erreur instanceof Prisma.PrismaClientKnownRequestError && erreur.code === "P2002") {
      return;
    }
    throw erreur;
  }
}

function statutDepuisAbonnement(status: Stripe.Subscription.Status): string {
  // Aligné sur les valeurs documentées dans prisma/schema.prisma (User.subscriptionStatus).
  if (status === "active" || status === "trialing") return status;
  if (status === "past_due" || status === "unpaid") return "past_due";
  if (status === "canceled" || status === "incomplete_expired") return "canceled";
  return status;
}

async function utilisateurDepuisAbonnement(subscription: Stripe.Subscription) {
  const parSub = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id },
    select: { id: true, stripeSubscriptionId: true },
  });
  if (parSub) return parSub;

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
  if (!customerId) return null;

  return prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true, stripeSubscriptionId: true },
  });
}

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

  if (await evenementDejaTraite(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "setup_intent.succeeded": {
        const setupIntent = event.data.object;
        const userId = setupIntent.metadata?.userId;
        const plan = setupIntent.metadata?.plan;
        const priceId = plan ? PRIX_MENSUEL_PAR_PLAN[plan] : undefined;

        if (!userId || !plan || !priceId) break;

        const existant = await prisma.user.findUnique({
          where: { id: userId },
          select: { stripeSubscriptionId: true },
        });
        // Évite un double abonnement si Stripe renvoie le même événement ou si l'artisan
        // reclique après succès (skill checkout-implementation : réutiliser le customer).
        if (existant?.stripeSubscriptionId) break;

        const paymentMethodId =
          typeof setupIntent.payment_method === "string"
            ? setupIntent.payment_method
            : setupIntent.payment_method?.id;
        const customerId =
          typeof setupIntent.customer === "string" ? setupIntent.customer : setupIntent.customer?.id;

        if (customerId && paymentMethodId) {
          await stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
          });

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
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const utilisateur = await utilisateurDepuisAbonnement(subscription);
        if (!utilisateur) break;

        const priceId = subscription.items.data[0]?.price?.id ?? null;
        const plan = planDepuisPriceId(priceId);

        await prisma.user.update({
          where: { id: utilisateur.id },
          data: {
            subscriptionStatus: statutDepuisAbonnement(subscription.status),
            stripeSubscriptionId: subscription.id,
            ...(plan ? { plan } : {}),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const utilisateur = await utilisateurDepuisAbonnement(subscription);
        if (!utilisateur) break;

        await prisma.user.update({
          where: { id: utilisateur.id },
          data: { subscriptionStatus: "canceled" },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { subscriptionStatus: "past_due" },
        });
        await envoyerEmailPaiementEchouePourClient(customerId).catch((erreur) => {
          console.error("Email paiement échoué non envoyé :", erreur);
        });
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode !== "subscription") break;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: "active",
              ...(plan ? { plan } : {}),
              ...(customerId ? { stripeCustomerId: customerId } : {}),
              ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
            },
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId, subscriptionStatus: "past_due" },
          data: { subscriptionStatus: "active" },
        });
        break;
      }

      default:
        break;
    }

    await marquerEvenementTraite(event.id, event.type);
  } catch (erreur) {
    console.error(`Erreur traitement webhook Stripe (${event.type}, ${event.id}) :`, erreur);
    return NextResponse.json({ erreur: "Traitement échoué." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
