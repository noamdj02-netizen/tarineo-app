import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PRIX_MENSUEL_PAR_PLAN } from "@/lib/stripe";
import { origineActuelle } from "@/lib/origine";
import { PLANS_STRIPE, type PlanStripe } from "@/lib/plansStripe";

const schema = z.object({
  plan: z.enum(["starter", "pro", "equipe"]),
});

/** Checkout Session pour changement de plan (utilisateur déjà abonné ou premier paiement). */
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
  const priceId = PRIX_MENSUEL_PAR_PLAN[plan];
  if (!priceId) {
    return NextResponse.json({ erreur: "Prix Stripe non configuré" }, { status: 500 });
  }

  const utilisateur = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true, stripeSubscriptionId: true },
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

  // Abonné actif : mise à jour via Checkout (mode subscription) avec customer existant
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
    ...(utilisateur.stripeSubscriptionId
      ? {}
      : {
          payment_method_collection: "always",
        }),
  });

  return NextResponse.json({ url: checkout.url });
}
