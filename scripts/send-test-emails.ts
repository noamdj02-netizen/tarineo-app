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
      CheckInEmail,
      CheckInEmailShort,
      CHECK_IN_SUBJECT,
      WelcomeEmail,
    } = await import("@/emails/index");
    const list = [
      { subject: "[TARINEO] Bienvenue", react: WelcomeEmail({ firstName: "Noam", appUrl }) },
      { subject: "[TARINEO] Confirme ton compte", react: AuthSignupEmail({ appUrl, confirmationUrl: callback, token: "482913" }) },
      {
        subject: "[TARINEO] Ton lien de connexion",
        react: AuthMagicLinkEmail({ appUrl, confirmationUrl: callback, token: "12345678" }),
      },
      {
        subject: "[TARINEO] Nouveau mot de passe",
        react: AuthResetPasswordEmail({ appUrl, confirmationUrl: `${appUrl}/nouveau-mot-de-passe`, token: "482913" }),
      },
      { subject: "[TARINEO] Confirme ta nouvelle adresse", react: AuthEmailChangeEmail({ appUrl, confirmationUrl: callback }) },
      { subject: "[TARINEO] Bienvenue en Pro", react: BillingProWelcomeEmail({ appUrl }) },
      { subject: "[TARINEO] Merci, Fondateur", react: BillingFounderEmail({ appUrl }) },
      {
        subject: "[TARINEO] Prix fidélité",
        react: BillingLoyaltyEmail({ appUrl, price: 12, intervalLabel: "par mois", yearsLabel: "un an" }),
      },
      { subject: "[TARINEO] Paiement refusé", react: BillingPaymentFailedEmail({ appUrl }) },
      {
        subject: "[TARINEO] Abonnement annulé",
        react: BillingCancelledEmail({ appUrl, endDate: "12 avril 2026" }),
      },
      {
        subject: `[TARINEO] ${CHECK_IN_SUBJECT}`,
        react: CheckInEmail({ firstName: "Noam", appUrl }),
      },
      {
        subject: "[TARINEO] Petit check de Noam (version courte)",
        react: CheckInEmailShort({ firstName: "Noam", appUrl }),
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
    CheckInEmail,
    CheckInEmailShort,
    CHECK_IN_SUBJECT,
    WelcomeEmail,
  } = await import("@/emails/index");

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY manquant (.env.local ou variable d’environnement).");
    process.exit(1);
  }
  const to = process.argv[2] ?? "noamdj02@gmail.com";
  const from = process.env.EMAIL_FROM ?? "TARINEO <contact@tarineo.fr>";
  const appUrl = getSiteUrl();
  const callback = `${appUrl}/auth/callback`;
  const resend = new Resend(key);

  const sends = [
    { subject: "[TARINEO] Bienvenue", react: WelcomeEmail({ firstName: "Noam", appUrl }) },
    { subject: "[TARINEO] Confirme ton compte", react: AuthSignupEmail({ appUrl, confirmationUrl: callback, token: "482913" }) },
    {
      subject: "[TARINEO] Ton lien de connexion",
      react: AuthMagicLinkEmail({ appUrl, confirmationUrl: callback, token: "12345678" }),
    },
    {
      subject: "[TARINEO] Nouveau mot de passe",
      react: AuthResetPasswordEmail({ appUrl, confirmationUrl: `${appUrl}/nouveau-mot-de-passe`, token: "482913" }),
    },
    {
      subject: "[TARINEO] Confirme ta nouvelle adresse",
      react: AuthEmailChangeEmail({ appUrl, confirmationUrl: callback }),
    },
    { subject: "[TARINEO] Bienvenue en Pro", react: BillingProWelcomeEmail({ appUrl }) },
    { subject: "[TARINEO] Merci, Fondateur", react: BillingFounderEmail({ appUrl }) },
    {
      subject: "[TARINEO] Prix fidélité",
      react: BillingLoyaltyEmail({
        appUrl,
        price: 12,
        intervalLabel: "par mois",
        yearsLabel: "un an",
      }),
    },
    { subject: "[TARINEO] Paiement refusé", react: BillingPaymentFailedEmail({ appUrl }) },
    {
      subject: "[TARINEO] Abonnement annulé",
      react: BillingCancelledEmail({ appUrl, endDate: "12 avril 2026" }),
    },
    {
      subject: `[TARINEO] ${CHECK_IN_SUBJECT}`,
      react: CheckInEmail({ firstName: "Noam", appUrl }),
    },
    {
      subject: "[TARINEO] Petit check de Noam (version courte)",
      react: CheckInEmailShort({ firstName: "Noam", appUrl }),
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
