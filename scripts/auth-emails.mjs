// Pousse les emails Supabase Auth en français, style Navpit (mascotte + layout Dither-like).
// Usage : SUPABASE_ACCESS_TOKEN=sbp_… node scripts/auth-emails.mjs [--dry]
// Nécessite SMTP custom sur le projet (sinon l’API refuse les templates custom).

import { navpitTransactionalHtml } from "../emails/html-shell.mjs";

const PROJECT = "tmhijqvuflokcsgcfolu";

const config = {
  mailer_subjects_confirmation: "Confirme ton compte Navpit",
  mailer_templates_confirmation_content: navpitTransactionalHtml({
    label: "Inscription",
    title: "Plus qu’un clic",
    body: "Entre ce code sur la page d’inscription, ou clique le bouton. Il est valable une heure.",
    code: "{{ .Token }}",
    ctaHref: "{{ .ConfirmationURL }}",
    ctaLabel: "Confirmer mon email",
  }),
  mailer_subjects_magic_link: "Ton lien de connexion Navpit",
  mailer_templates_magic_link_content: navpitTransactionalHtml({
    label: "Connexion",
    title: "Ton lien de connexion",
    body: "Colle ce code sur la page de connexion Navpit, ou utilise le bouton (lien à usage unique, ~1 h).",
    code: "{{ .Token }}",
    ctaHref: "{{ .ConfirmationURL }}",
    ctaLabel: "Me connecter",
  }),
  mailer_subjects_recovery: "Nouveau mot de passe Navpit",
  mailer_templates_recovery_content: navpitTransactionalHtml({
    label: "Mot de passe",
    title: "Nouveau mot de passe",
    body: "Entre ce code sur la page « mot de passe oublié », ou clique le bouton. Il est valable une heure.",
    code: "{{ .Token }}",
    ctaHref: "{{ .ConfirmationURL }}",
    ctaLabel: "Choisir mon mot de passe",
  }),
  mailer_subjects_email_change: "Confirme ta nouvelle adresse Navpit",
  mailer_templates_email_change_content: navpitTransactionalHtml({
    label: "Email",
    title: "Confirme ta nouvelle adresse",
    body: "Clique pour utiliser cette adresse email sur ton compte Navpit.",
    ctaHref: "{{ .ConfirmationURL }}",
    ctaLabel: "Confirmer l’adresse",
  }),
};

if (process.argv.includes("--dry")) {
  console.log(Object.keys(config).join("\n"));
  process.exit(0);
}

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("SUPABASE_ACCESS_TOKEN manquant.");
  process.exit(1);
}
const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT}/config/auth`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(config),
});
console.log(res.ok ? "Emails Auth mis à jour." : `Échec ${res.status} : ${await res.text()}`);
