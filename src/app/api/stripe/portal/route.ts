import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { origineActuelle } from "@/lib/origine";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const utilisateur = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!utilisateur?.stripeCustomerId) {
    return NextResponse.json({ erreur: "Aucun compte de facturation Stripe." }, { status: 400 });
  }

  const origine = await origineActuelle();
  const portail = await stripe.billingPortal.sessions.create({
    customer: utilisateur.stripeCustomerId,
    return_url: `${origine}/parametres?onglet=abonnement`,
  });

  return NextResponse.json({ url: portail.url });
}
