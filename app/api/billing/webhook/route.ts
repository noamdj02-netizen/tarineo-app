import { NextResponse } from "next/server";
import { handleStripeEvent } from "@/lib/billing/stripe-events";
import { getStripe, isStripeConfigured } from "@/lib/billing/stripe";

export const runtime = "nodejs";

/** Stripe → table public.subscriptions. Branche l’URL https://app.tarineo.com/api/billing/webhook */
export async function POST(req: Request) {
  if (!isStripeConfigured()) return new NextResponse("Stripe non configuré", { status: 503 });
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) return new NextResponse("STRIPE_WEBHOOK_SECRET manquant", { status: 503 });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new NextResponse("Signature manquante", { status: 400 });

  let event;
  try {
    event = getStripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return new NextResponse("Signature invalide", { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch (e) {
    console.error("[billing] webhook", event.type, e);
    return new NextResponse("Erreur", { status: 500 });
  }
  return NextResponse.json({ received: true });
}
