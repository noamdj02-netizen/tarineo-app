import { NextResponse, type NextRequest } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/billing/stripe";
import { getDb } from "@/lib/db";
import { isDeployedRuntime } from "@/lib/runtime-config";
import { getSiteUrl } from "@/lib/site-url";

/** Portail client Stripe : carte bancaire, factures, résiliation. */
export async function POST(request: NextRequest) {
  const origin = isDeployedRuntime() ? getSiteUrl() : request.nextUrl.origin;
  const db = await getDb();
  if (!db) return NextResponse.redirect(`${origin}/login?next=/abonnement`, 303);
  if (!isStripeConfigured()) return NextResponse.redirect(`${origin}/abonnement?erreur=config`, 303);

  const { data } = await db.supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", db.user.id)
    .maybeSingle();
  if (!data?.stripe_customer_id) {
    return NextResponse.redirect(`${origin}/abonnement?erreur=stripe`, 303);
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      locale: "fr",
      return_url: `${origin}/abonnement`,
    });
    return NextResponse.redirect(session.url, 303);
  } catch (e) {
    console.error("[billing] portal", e);
    return NextResponse.redirect(`${origin}/abonnement?erreur=stripe`, 303);
  }
}
