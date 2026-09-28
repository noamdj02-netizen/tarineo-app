import "server-only";
import Stripe from "stripe";
import { BillingCancelledEmail } from "@/emails/billing-cancelled";
import { BillingFounderEmail } from "@/emails/billing-founder";
import { BillingLoyaltyEmail } from "@/emails/billing-loyalty";
import { BillingPaymentFailedEmail } from "@/emails/billing-payment-failed";
import { BillingProWelcomeEmail } from "@/emails/billing-pro-welcome";
import { BillingStarterWelcomeEmail } from "@/emails/billing-starter-welcome";
import { sendEmail } from "@/lib/email/send";
import { getSiteUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { SUBSCRIPTION_LOYALTY, tierFor, type Interval } from "./plans";
import { getStripe, isStripeConfigured, planLookupKey } from "./stripe";

const iso = (s: number | null | undefined) => (s ? new Date(s * 1000).toISOString() : null);

function admin() {
  return createAdminClient();
}

function customerId(ref: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null {
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

function intervalOf(item: Stripe.SubscriptionItem | undefined): Interval {
  return item?.price.recurring?.interval === "year" ? "year" : "month";
}

function planFromLookup(lookup: string, metaPlan?: string | null): "starter" | "pro" {
  if (lookup.includes("starter") || metaPlan === "starter") return "starter";
  return "pro";
}

function tierFromLookup(lookup: string) {
  const m = lookup.match(/_t(\d)$/);
  return m ? Number(m[1]) : 0;
}

function periodEnd(sub: Stripe.Subscription, item?: Stripe.SubscriptionItem) {
  const fromItem = item?.current_period_end;
  const fromSub = (sub as { current_period_end?: number }).current_period_end;
  return iso(fromItem ?? fromSub);
}

function subscriptionRefFromInvoice(invoice: Stripe.Invoice): string | null {
  const parent = invoice.parent;
  const fromParent =
    parent?.type === "subscription_details" ? parent.subscription_details?.subscription : null;
  const legacy = (invoice as { subscription?: string | { id: string } | null }).subscription;
  const ref = fromParent ?? legacy ?? null;
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

async function userIdFor(sub: Stripe.Subscription): Promise<string | null> {
  if (sub.metadata?.user_id) return sub.metadata.user_id;
  const customer = customerId(sub.customer);
  if (!customer) return null;
  const { data } = await admin()
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customer)
    .maybeSingle();
  return data?.user_id ?? null;
}

export async function syncSubscription(sub: Stripe.Subscription) {
  const userId = await userIdFor(sub);
  if (!userId) return;
  const item = sub.items.data[0];
  const lookup = item?.price.lookup_key ?? "";
  const { data: existing } = await admin()
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing?.plan === "founder") return;

  const live = ["active", "trialing", "past_due"].includes(sub.status);
  const plan: "free" | "starter" | "pro" = live
    ? planFromLookup(lookup, sub.metadata?.plan)
    : "free";

  await admin().from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: customerId(sub.customer),
    stripe_subscription_id: sub.id,
    plan,
    status: sub.status,
    billing_interval: intervalOf(item),
    tier: tierFromLookup(lookup),
    started_at: iso(sub.start_date),
    current_period_end: periodEnd(sub, item),
    cancel_at_period_end: sub.cancel_at_period_end,
  });
}

async function applyLoyalty(invoice: Stripe.Invoice) {
  const ref = subscriptionRefFromInvoice(invoice);
  if (!ref) return;
  const sub = await getStripe().subscriptions.retrieve(ref);
  const item = sub.items.data[0];
  const lookup = item?.price.lookup_key ?? "";
  const plan = lookup.includes("_starter_")
    ? "starter"
    : lookup.includes("_pro_")
      ? "pro"
      : null;
  if (!plan || !item) return;

  const interval = intervalOf(item);
  const current = tierFromLookup(lookup);
  const target = tierFor(new Date(sub.start_date * 1000));
  if (target <= current) return;

  const { data: prices } = await getStripe().prices.list({
    lookup_keys: [planLookupKey(plan, interval, target)],
    active: true,
    limit: 1,
  });
  if (!prices[0]) return;

  const updated = await getStripe().subscriptions.update(sub.id, {
    items: [{ id: item.id, price: prices[0].id }],
    proration_behavior: "none",
  });
  await syncSubscription(updated);

  const to = invoice.customer_email;
  if (!to) return;
  const yearsLabel = target === 1 ? "un an" : "deux ans";
  const intervalLabel = interval === "month" ? ("par mois" as const) : ("par an" as const);
  await sendEmail(
    to,
    `Merci d’être là depuis ${yearsLabel} : ton prix baisse`,
    BillingLoyaltyEmail({
      appUrl: getSiteUrl(),
      price: SUBSCRIPTION_LOYALTY[plan][interval][target],
      intervalLabel,
      yearsLabel,
    }),
  );
}

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  opts: { email?: boolean } = {},
) {
  const notify = opts.email !== false;
  const userId = session.client_reference_id ?? session.metadata?.user_id;
  if (!userId) return;
  const customer = customerId(session.customer);
  const appUrl = getSiteUrl();
  const to = session.customer_details?.email;

  if (session.mode === "payment" && session.metadata?.plan === "founder" && session.payment_status === "paid") {
    await admin().from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: customer,
      stripe_subscription_id: null,
      plan: "founder",
      status: "lifetime",
      started_at: new Date().toISOString(),
      current_period_end: null,
      cancel_at_period_end: false,
    });
    if (notify && to) await sendEmail(to, "Merci, Fondateur !", BillingFounderEmail({ appUrl }));
    return;
  }

  if (session.mode === "subscription" && session.subscription) {
    await admin()
      .from("subscriptions")
      .upsert({ user_id: userId, stripe_customer_id: customer }, { onConflict: "user_id" });
    const sub = await getStripe().subscriptions.retrieve(
      typeof session.subscription === "string" ? session.subscription : session.subscription.id,
    );
    await syncSubscription(sub);
    if (notify && to) {
      const plan = session.metadata?.plan === "starter" ? "starter" : "pro";
      if (plan === "starter") {
        await sendEmail(to, "Bienvenue en Création !", BillingStarterWelcomeEmail({ appUrl }));
      } else {
        await sendEmail(to, "Bienvenue en Pro !", BillingProWelcomeEmail({ appUrl }));
      }
    }
  }
}

/** Confirme un retour Checkout même si le webhook n’a pas encore abouti. */
export async function fulfillCheckoutSession(sessionId: string, userId: string) {
  if (!isStripeConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });
    const owner = session.client_reference_id ?? session.metadata?.user_id;
    if (owner !== userId || session.status !== "complete") return;
    await handleCheckoutCompleted(session, { email: false });
  } catch (e) {
    console.error("[billing] fulfill", e);
  }
}

export async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      return;
    case "invoice.payment_failed": {
      const inv = event.data.object;
      if (inv.customer_email) {
        await sendEmail(
          inv.customer_email,
          "Votre paiement TARINEO n’est pas passé",
          BillingPaymentFailedEmail({ appUrl: getSiteUrl() }),
        );
      }
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await syncSubscription(event.data.object);
      return;
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await syncSubscription(sub);
      const email =
        typeof sub.customer === "object" && sub.customer && "email" in sub.customer
          ? (sub.customer.email ?? undefined)
          : undefined;
      if (email) {
        const end = periodEnd(sub, sub.items.data[0]);
        const endDate = end
          ? new Date(end).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : undefined;
        await sendEmail(
          email,
          "Votre abonnement TARINEO se termine",
          BillingCancelledEmail({ appUrl: getSiteUrl(), endDate }),
        );
      }
      return;
    }
    case "invoice.paid":
      await applyLoyalty(event.data.object);
      return;
  }
}
