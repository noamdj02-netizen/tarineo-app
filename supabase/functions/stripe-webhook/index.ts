// Webhook Stripe → table public.subscriptions (Supabase Edge Function, Deno).
// Tourne chez Supabase : la clé service role n'a pas besoin d'être sur Vercel.
// Secrets : STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY (optionnel), EMAIL_FROM (optionnel).
// Déployer sans vérification JWT : supabase functions deploy stripe-webhook --no-verify-jwt

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
const TIER_PRICE = { month: [15, 12, 9], year: [150, 120, 90] } as const;
type Interval = "month" | "year";
const proLookupKey = (interval: Interval, tier: number) => `navpit_pro_${interval}_t${tier}`;

function tierFor(startedAt: Date, now = new Date()) {
  const months =
    (now.getUTCFullYear() - startedAt.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - startedAt.getUTCMonth()) -
    (now.getUTCDate() < startedAt.getUTCDate() ? 1 : 0);
  return months >= 24 ? 2 : months >= 12 ? 1 : 0;
}

const iso = (s: number | null | undefined) => (s ? new Date(s * 1000).toISOString() : null);

async function userIdFor(sub: Stripe.Subscription): Promise<string | null> {
  if (sub.metadata?.user_id) return sub.metadata.user_id;
  const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
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
  const interval = (item?.price.recurring?.interval === "year" ? "year" : "month") as Interval;
  const tierMatch = item?.price.lookup_key?.match(/_t(\d)$/);

  const { data: existing } = await admin
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();
  // un Fondateur reste Fondateur, même si un vieil abonnement se termine
  if (existing?.plan === "founder") return;

  const live = ["active", "trialing", "past_due"].includes(sub.status);
  await admin.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripe_subscription_id: sub.id,
    plan: live ? "pro" : "free",
    status: sub.status,
    billing_interval: interval,
    tier: tierMatch ? Number(tierMatch[1]) : 0,
    started_at: iso(sub.start_date),
    current_period_end: iso(item?.current_period_end),
    cancel_at_period_end: sub.cancel_at_period_end,
  });
}

/** À chaque facture payée : si l'anniversaire est passé, bascule sur le palier moins cher. */
async function applyLoyalty(invoice: Stripe.Invoice) {
  const ref = invoice.parent?.subscription_details?.subscription;
  if (!ref) return;
  const sub = await stripe.subscriptions.retrieve(typeof ref === "string" ? ref : ref.id);
  const item = sub.items.data[0];
  if (!item?.price.lookup_key?.startsWith("navpit_pro_")) return;

  const interval = (item.price.recurring?.interval === "year" ? "year" : "month") as Interval;
  const current = Number(item.price.lookup_key.match(/_t(\d)$/)?.[1] ?? 0);
  const target = tierFor(new Date(sub.start_date * 1000));
  if (target <= current) return;

  const { data: prices } = await stripe.prices.list({
    lookup_keys: [proLookupKey(interval, target)],
    active: true,
    limit: 1,
  });
  if (!prices[0]) return;

  const updated = await stripe.subscriptions.update(sub.id, {
    items: [{ id: item.id, price: prices[0].id }],
    // la baisse s'applique à la prochaine facture, sans avoir ni prorata
    proration_behavior: "none",
  });
  await syncSubscription(updated);
  await sendLoyaltyEmail(invoice.customer_email, interval, target);
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

async function sendLoyaltyEmail(to: string | null, interval: Interval, tier: number) {
  const price = TIER_PRICE[interval][tier];
  const unit = interval === "month" ? "par mois" : "par an";
  const years = tier === 1 ? "un an" : "deux ans";
  await sendEmail(to, `Merci d’être là depuis ${years} : ton prix baisse`, {
    label: "Prix fidélité",
    title: `Ton prix passe à ${price} € ${unit}`,
    body: `Tu es abonné à Navpit Pro depuis ${years}. Comme promis, ton prix baisse dès ta prochaine facture, sans rien faire. Merci de ta confiance.`,
  });
}

async function handle(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      const userId = s.client_reference_id ?? s.metadata?.user_id;
      if (!userId) return;
      const customer = typeof s.customer === "string" ? s.customer : s.customer?.id ?? null;
      if (s.mode === "payment" && s.metadata?.plan === "founder" && s.payment_status === "paid") {
        await admin.from("subscriptions").upsert({
          user_id: userId,
          stripe_customer_id: customer,
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
        await sendEmail(s.customer_details?.email, "Bienvenue en Pro !", {
          label: "Pro",
          title: "Bienvenue en Pro",
          body: "Projets illimités, 500 questions IA par mois, schémas illimités et agenda synchronisé. Et ton prix baissera à chaque anniversaire d’abonnement.",
          ctaHref: `${APP_URL}/accueil`,
          ctaLabel: "Ouvrir Navpit",
        });
      }
      return;
    }
    case "invoice.payment_failed": {
      const inv = event.data.object;
      await sendEmail(inv.customer_email, "Ton paiement Navpit n’est pas passé", {
        label: "Paiement",
        title: "Paiement refusé",
        body: "Stripe va réessayer dans quelques jours. Pour garder Pro sans coupure, vérifie ta carte bancaire.",
        ctaHref: `${APP_URL}/abonnement`,
        ctaLabel: "Mettre à jour ma carte",
      });
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
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
