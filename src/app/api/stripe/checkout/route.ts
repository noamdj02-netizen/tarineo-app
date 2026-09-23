import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PRIX_MENSUEL_PAR_PLAN } from "@/lib/stripe";
import { erreurCheckoutSiConfigIncomplete } from "@/lib/stripeConfig";
import { origineActuelle } from "@/lib/origine";
import { PLANS_STRIPE, type PlanStripe } from "@/lib/plansStripe";

const schema = z.object({
  plan: z.enum(["starter", "pro", "equipe"]),
});

/** Checkout Session pour premier abonnement, ou mise à jour du plan si déjà abonné. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non autorisé" }, { status: 401 });
  }

  const corps = schema.safeParse(await request.json());
  if (!corps.success || !PLANS_STRIPE.includes(corps.data.plan as PlanStripe)) {
    return NextResponse.json({ erreur: "Plan invalide" }, { status: 400 });
  }

  const plan = corps.data.plan;

  const configIncomplete = erreurCheckoutSiConfigIncomplete();
  if (configIncomplete) {
    return NextResponse.json({ erreur: configIncomplete }, { status: 503 });
  }

  const priceId = PRIX_MENSUEL_PAR_PLAN[plan];
  if (!priceId) {
    console.error(`[Tarineo Stripe] STRIPE_PRICE_* manquant pour le plan « ${plan} ».`);
    return NextResponse.json(
      { erreur: "L'abonnement n'est pas disponible pour le moment. Contactez le support." },
      { status: 503 },
    );
  }

  const utilisateur = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      subscriptionStatus: true,
    },
  });
  if (!utilisateur) {
    return NextResponse.json({ erreur: "Compte introuvable" }, { status: 404 });
  }

  let customerId = utilisateur.stripeCustomerId;
  if (!customerId) {
    const client = await stripe.customers.create({
      email: utilisateur.email,
      metadata: { userId: session.user.id },
    });
    customerId = client.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const origine = await origineActuelle();

  // Déjà abonné : on met à jour l'abonnement existant (évite un 2ᵉ abonnement
  // facturé en parallèle si on ouvrait un nouveau Checkout Session).
  const abonnementActif =
    Boolean(utilisateur.stripeSubscriptionId) &&
    (utilisateur.subscriptionStatus === "active" || utilisateur.subscriptionStatus === "trialing");

  if (abonnementActif && utilisateur.stripeSubscriptionId) {
    try {
      const abonnement = await stripe.subscriptions.retrieve(utilisateur.stripeSubscriptionId);
      const itemId = abonnement.items.data[0]?.id;
      if (!itemId) {
        return NextResponse.json({ erreur: "Abonnement Stripe incomplet" }, { status: 500 });
      }

      const actuelPriceId = abonnement.items.data[0]?.price?.id;
      if (actuelPriceId === priceId) {
        return NextResponse.json({
          url: `${origine}/parametres?onglet=abonnement&plan=deja`,
        });
      }

      await stripe.subscriptions.update(utilisateur.stripeSubscriptionId, {
        items: [{ id: itemId, price: priceId }],
        proration_behavior: "create_prorations",
        metadata: { userId: session.user.id, plan },
      });

      await prisma.user.update({
        where: { id: session.user.id },
        data: { plan },
      });

      return NextResponse.json({
        url: `${origine}/parametres?onglet=abonnement&plan=ok`,
      });
    } catch (erreur) {
      console.error("Mise à jour abonnement Stripe :", erreur);
      return NextResponse.json(
        { erreur: "Impossible de changer de plan pour le moment." },
        { status: 500 },
      );
    }
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origine}/parametres?onglet=abonnement&checkout=ok`,
    cancel_url: `${origine}/parametres?onglet=abonnement`,
    metadata: { userId: session.user.id, plan },
    subscription_data: {
      metadata: { userId: session.user.id, plan },
    },
    payment_method_collection: "always",
  });

  return NextResponse.json({ url: checkout.url });
}
