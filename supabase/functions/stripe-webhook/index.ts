// Webhook Stripe → table public.subscriptions (Supabase Edge Function, Deno).
// Tourne chez Supabase : la clé service role n'a pas besoin d'être sur Vercel.
// Secrets : STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY (optionnel), EMAIL_FROM (optionnel).
// Déployer sans vérification JWT : supabase functions deploy stripe-webhook --no-verify-jwt
// En prod, le webhook Next.js `/api/billing/webhook` est la cible principale.

import Stripe from "npm:stripe@22";
import { createClient } from "npm:@supabase/supabase-js@2";
import { navpitTransactionalHtml } from "../_shared/navpit-email-html.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

// Mêmes paliers et clés que lib/billing/plans.ts et lib/billing/stripe.ts.
const LOYALTY = {
  starter: { month: [15, 12, 9], year: [150, 120, 90] },
  pro: { month: [30, 24, 18], year: [300, 240, 180] },
} as const;
type Interval = "month" | "year";
type PaidPlan = "starter" | "pro";
const planLookupKey = (plan: PaidPlan, interval: Interval, tier: number) =>
  tier === 0 ? `navpit_${plan}_${interval}` : `navpit_${plan}_${interval}_t${tier}`;

function tierFor(startedAt: Date, now = new Date()) {
  const months =
    (now.getUTCFullYear() - startedAt.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - startedAt.getUTCMonth()) -
    (now.getUTCDate() < startedAt.getUTCDate() ? 1 : 0);
  return months >= 24 ? 2 : months >= 12 ? 1 : 0;
}

const iso = (s: number | null | undefined) => (s ? new Date(s * 1000).toISOString() : null);

function customerId(ref: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null {
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

function intervalOf(item: Stripe.SubscriptionItem | undefined): Interval {
  return item?.price.recurring?.interval === "year" ? "year" : "month";
}

function planFromLookup(lookup: string, metaPlan?: string | null): PaidPlan {
  if (lookup.startsWith("navpit_starter_") || metaPlan === "starter") return "starter";
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
  const { data } = await admin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customer)
    .maybeSingle();
  return data?.user_id ?? null;
}

async function syncSubscription(sub: Stripe.Subscription) {
  const userId = await userIdFor(sub);
  if (!userId) return;
  const item = sub.items.data[0];
  const lookup = item?.price.lookup_key ?? "";

  const { data: existing } = await admin
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();
  // un Fondateur reste Fondateur, même si un vieil abonnement se termine
  if (existing?.plan === "founder") return;

  const live = ["active", "trialing", "past_due"].includes(sub.status);
  const plan: "free" | PaidPlan = live ? planFromLookup(lookup, sub.metadata?.plan) : "free";
  await admin.from("subscriptions").upsert({
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

/** À chaque facture payée : si l'anniversaire est passé, bascule sur le palier moins cher. */
async function applyLoyalty(invoice: Stripe.Invoice) {
  const ref = subscriptionRefFromInvoice(invoice);
  if (!ref) return;
  const sub = await stripe.subscriptions.retrieve(ref);
  const item = sub.items.data[0];
  const lookup = item?.price.lookup_key ?? "";
  const plan: PaidPlan | null = lookup.startsWith("navpit_starter_")
    ? "starter"
    : lookup.startsWith("navpit_pro_")
      ? "pro"
      : null;
  if (!plan || !item) return;

  const interval = intervalOf(item);
  const current = tierFromLookup(lookup);
  const target = tierFor(new Date(sub.start_date * 1000));
  if (target <= current) return;

  const { data: prices } = await stripe.prices.list({
    lookup_keys: [planLookupKey(plan, interval, target)],
    active: true,
    limit: 1,
  });
  if (!prices[0]) return;

  const updated = await stripe.subscriptions.update(sub.id, {
    items: [{ id: item.id, price: prices[0].id }],
    proration_behavior: "none",
  });
  await syncSubscription(updated);
  await sendLoyaltyEmail(invoice.customer_email, plan, interval, target);
}

const APP_URL = Deno.env.get("APP_URL") ?? "https://www.navpit.com";

async function sendEmail(
  to: string | null | undefined,
  subject: string,
  htmlOpts: Parameters<typeof navpitTransactionalHtml>[0],
) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key || !to) return;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("EMAIL_FROM") ?? "Navpit <bonjour@navpit.com>",
      to,
      subject,
      html: navpitTransactionalHtml({ ...htmlOpts, appUrl: APP_URL }),
    }),
  });
  if (!res.ok) console.error("[stripe-webhook] email", subject, res.status);
}

async function sendLoyaltyEmail(
  to: string | null,
  plan: PaidPlan,
  interval: Interval,
  tier: number,
) {
  const price = LOYALTY[plan][interval][tier];
  const unit = interval === "month" ? "par mois" : "par an";
  const years = tier === 1 ? "un an" : "deux ans";
  await sendEmail(to, `Merci d’être là depuis ${years} : ton prix baisse`, {
    label: "Prix fidélité",
    title: `Ton prix passe à ${price} € ${unit}`,
    body: `Tu es abonné à Navpit depuis ${years}. Comme promis, ton prix baisse dès ta prochaine facture, sans rien faire. Merci de ta confiance.`,
  });
}

async function handle(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      const userId = s.client_reference_id ?? s.metadata?.user_id;
      if (!userId) return;
      const customer = customerId(s.customer);
      if (s.mode === "payment" && s.metadata?.plan === "founder" && s.payment_status === "paid") {
        await admin.from("subscriptions").upsert({
          user_id: userId,
          stripe_customer_id: customer,
          stripe_subscription_id: null,
          plan: "founder",
          status: "lifetime",
          started_at: new Date().toISOString(),
          current_period_end: null,
          cancel_at_period_end: false,
        });
        await sendEmail(s.customer_details?.email, "Merci, Fondateur !", {
          label: "Fondateur",
          title: "Merci, Fondateur",
          body: "Ton paiement est reçu : tu as Navpit Pro à vie, sans abonnement. Merci de soutenir le projet dès le début.",
          ctaHref: `${APP_URL}/accueil`,
          ctaLabel: "Ouvrir Navpit",
          footer: "Tu fais partie des premiers : Navpit Pro à vie, sans abonnement.",
        });
        return;
      }
      if (s.mode === "subscription" && s.subscription) {
        await admin
          .from("subscriptions")
          .upsert({ user_id: userId, stripe_customer_id: customer }, { onConflict: "user_id" });
        const sub = await stripe.subscriptions.retrieve(
          typeof s.subscription === "string" ? s.subscription : s.subscription.id,
        );
        await syncSubscription(sub);
        const starter = s.metadata?.plan === "starter";
        await sendEmail(
          s.customer_details?.email,
          starter ? "Bienvenue en Création !" : "Bienvenue en Pro !",
          {
            label: starter ? "Création" : "Pro",
            title: starter ? "Bienvenue en Création" : "Bienvenue en Pro",
            body: starter
              ? "6 projets, 300 questions IA par mois et 100 schémas. Ton prix baissera à chaque anniversaire d’abonnement."
              : "Projets illimités, 500 questions IA par mois, schémas illimités et agenda synchronisé. Et ton prix baissera à chaque anniversaire d’abonnement.",
            ctaHref: `${APP_URL}/accueil`,
            ctaLabel: "Ouvrir Navpit",
          },
        );
      }
      return;
    }
    case "invoice.payment_failed": {
      const inv = event.data.object;
      await sendEmail(inv.customer_email, "Ton paiement Navpit n’est pas passé", {
        label: "Paiement",
        title: "Paiement refusé",
        body: "Stripe va réessayer dans quelques jours. Pour garder ton accès sans coupure, vérifie ta carte bancaire.",
        ctaHref: `${APP_URL}/abonnement`,
        ctaLabel: "Mettre à jour ma carte",
      });
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await syncSubscription(event.data.object);
      return;
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object);
      return;
    case "invoice.paid":
      await applyLoyalty(event.data.object);
      return;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Méthode non autorisée", { status: 405 });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Signature manquante", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      await req.text(),
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
      undefined,
      cryptoProvider,
    );
  } catch {
    return new Response("Signature invalide", { status: 400 });
  }

  try {
    await handle(event);
  } catch (e) {
    console.error("[stripe-webhook]", event.type, e);
    // 500 : Stripe renverra l'événement plus tard
    return new Response("Erreur", { status: 500 });
  }
  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
