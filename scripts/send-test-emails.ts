/**
 * Envoie tous les templates React Email via Resend.
 * Usage: npx tsx --env-file=.env.local scripts/send-test-emails.ts [destinataire]
 */
import React from "react";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { getSiteUrl } from "@/lib/site-url";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  if (process.env.RENDER_ONLY === "1") {
    const appUrl = getSiteUrl();
    const callback = `${appUrl}/auth/callback`;
    const {
      AuthEmailChangeEmail,
      AuthMagicLinkEmail,
      AuthResetPasswordEmail,
      AuthSignupEmail,
      BillingCancelledEmail,
      BillingFounderEmail,
      BillingLoyaltyEmail,
      BillingPaymentFailedEmail,
      BillingProWelcomeEmail,
      WelcomeEmail,
    } = await import("@/emails/index");
    const list = [
      { subject: "[Navpit] Bienvenue", react: WelcomeEmail({ firstName: "Noam", appUrl }) },
      { subject: "[Navpit] Confirme ton compte", react: AuthSignupEmail({ appUrl, confirmationUrl: callback, token: "482913" }) },
      {
        subject: "[Navpit] Ton lien de connexion",
        react: AuthMagicLinkEmail({ appUrl, confirmationUrl: callback, token: "12345678" }),
      },
      {
        subject: "[Navpit] Nouveau mot de passe",
        react: AuthResetPasswordEmail({ appUrl, confirmationUrl: `${appUrl}/nouveau-mot-de-passe`, token: "482913" }),
      },
      { subject: "[Navpit] Confirme ta nouvelle adresse", react: AuthEmailChangeEmail({ appUrl, confirmationUrl: callback }) },
      { subject: "[Navpit] Bienvenue en Pro", react: BillingProWelcomeEmail({ appUrl }) },
      { subject: "[Navpit] Merci, Fondateur", react: BillingFounderEmail({ appUrl }) },
      {
        subject: "[Navpit] Prix fidélité",
        react: BillingLoyaltyEmail({ appUrl, price: 12, intervalLabel: "par mois", yearsLabel: "un an" }),
      },
      { subject: "[Navpit] Paiement refusé", react: BillingPaymentFailedEmail({ appUrl }) },
      {
        subject: "[Navpit] Abonnement annulé",
        react: BillingCancelledEmail({ appUrl, endDate: "12 avril 2026" }),
      },
    ];
    const out = [];
    for (const s of list) out.push({ subject: s.subject, html: await render(s.react) });
    process.stdout.write(JSON.stringify(out));
    return;
  }

  const {
    AuthEmailChangeEmail,
    AuthMagicLinkEmail,
    AuthResetPasswordEmail,
    AuthSignupEmail,
    BillingCancelledEmail,
    BillingFounderEmail,
    BillingLoyaltyEmail,
    BillingPaymentFailedEmail,
    BillingProWelcomeEmail,
    WelcomeEmail,
  } = await import("@/emails/index");

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY manquant (.env.local ou variable d’environnement).");
    process.exit(1);
  }
  const to = process.argv[2] ?? "noamdj02@gmail.com";
  const from = process.env.EMAIL_FROM ?? "Navpit <bonjour@navpit.com>";
  const appUrl = getSiteUrl();
  const callback = `${appUrl}/auth/callback`;
  const resend = new Resend(key);

  const sends = [
    { subject: "[Navpit] Bienvenue", react: WelcomeEmail({ firstName: "Noam", appUrl }) },
    { subject: "[Navpit] Confirme ton compte", react: AuthSignupEmail({ appUrl, confirmationUrl: callback, token: "482913" }) },
    {
      subject: "[Navpit] Ton lien de connexion",
      react: AuthMagicLinkEmail({ appUrl, confirmationUrl: callback, token: "12345678" }),
    },
    {
      subject: "[Navpit] Nouveau mot de passe",
      react: AuthResetPasswordEmail({ appUrl, confirmationUrl: `${appUrl}/nouveau-mot-de-passe`, token: "482913" }),
    },
    {
      subject: "[Navpit] Confirme ta nouvelle adresse",
      react: AuthEmailChangeEmail({ appUrl, confirmationUrl: callback }),
    },
    { subject: "[Navpit] Bienvenue en Pro", react: BillingProWelcomeEmail({ appUrl }) },
    { subject: "[Navpit] Merci, Fondateur", react: BillingFounderEmail({ appUrl }) },
    {
      subject: "[Navpit] Prix fidélité",
      react: BillingLoyaltyEmail({
        appUrl,
        price: 12,
        intervalLabel: "par mois",
        yearsLabel: "un an",
      }),
    },
    { subject: "[Navpit] Paiement refusé", react: BillingPaymentFailedEmail({ appUrl }) },
    {
      subject: "[Navpit] Abonnement annulé",
      react: BillingCancelledEmail({ appUrl, endDate: "12 avril 2026" }),
    },
  ];

  console.log(`Envoi de ${sends.length} emails → ${to} (from: ${from})`);

  for (const s of sends) {
    const html = await render(s.react);
    const { data, error } = await resend.emails.send({ from, to, subject: s.subject, html });
    if (error) console.error("✗", s.subject, error);
    else console.log("✓", s.subject, data?.id);
    await sleep(350);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
