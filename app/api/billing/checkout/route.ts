import { NextResponse, type NextRequest } from "next/server";
import { planFor } from "@/lib/billing/plan";
import { FOUNDER, type Interval, type PlanId } from "@/lib/billing/plans";
import {
  FOUNDER_LOOKUP_KEY,
  getStripe,
  isStripeConfigured,
  priceIdFor,
  proPriceId,
  starterLookupKey,
} from "@/lib/billing/stripe";
import { getDb } from "@/lib/db";

function parsePlan(raw: FormDataEntryValue | null): PlanId {
  if (raw === "founder") return "founder";
  if (raw === "starter") return "starter";
  return "pro";
}

/** Formulaire de /abonnement : crée la session Stripe Checkout et y redirige. */
export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const back = (q: string) => NextResponse.redirect(`${origin}/abonnement?${q}`, 303);

  const db = await getDb();
  if (!db) return NextResponse.redirect(`${origin}/login?next=/abonnement`, 303);
  if (!isStripeConfigured()) return back("erreur=config");

  const form = await request.formData();
  const plan = parsePlan(form.get("plan"));
  const interval: Interval = form.get("interval") === "year" ? "year" : "month";

  const current = await planFor(db);
  if (current.plan === "founder" || current.hasPaidSubscription) return back("erreur=deja");
  const { track } = await import("@/lib/analytics/track");
  await track({
    name: "checkout_started",
    userId: db.user.id,
    feature: "pricing",
    plan,
    path: "/abonnement",
    properties: { interval },
  });

  const { data: sub } = await db.supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", db.user.id)
    .maybeSingle();
  const customer = sub?.stripe_customer_id ?? undefined;
  const meta = { user_id: db.user.id };

  try {
    const stripe = getStripe();
    if (plan === "founder") {
      const { data: taken } = await db.supabase.rpc("founder_seats_taken");
      if ((taken ?? 0) >= FOUNDER.seats) return back("erreur=complet");
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: await priceIdFor(FOUNDER_LOOKUP_KEY), quantity: 1 }],
        client_reference_id: db.user.id,
        metadata: { ...meta, plan: "founder" },
        payment_intent_data: { metadata: { ...meta, plan: "founder" } },
        ...(customer
          ? { customer }
          : { customer_email: db.user.email, customer_creation: "always" as const }),
        locale: "fr",
        success_url: `${origin}/abonnement?ok=founder&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/abonnement?plan=founder`,
      });
      return NextResponse.redirect(session.url!, 303);
    }

    const priceId =
      plan === "starter" ? await priceIdFor(starterLookupKey(interval)) : await proPriceId(interval);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: db.user.id,
      metadata: { ...meta, plan },
      subscription_data: { metadata: { ...meta, plan } },
      ...(customer ? { customer } : { customer_email: db.user.email }),
      allow_promotion_codes: true,
      locale: "fr",
      success_url: `${origin}/abonnement?ok=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/abonnement?plan=${plan}&interval=${interval}`,
    });
    return NextResponse.redirect(session.url!, 303);
  } catch (e) {
    console.error("[billing] checkout", e);
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Prix Stripe introuvable")) return back("erreur=prix");
    return back("erreur=stripe");
  }
}
