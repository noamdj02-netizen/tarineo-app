// Pousse les emails Supabase Auth en français, aux couleurs Navpit (même mise en page que emails/layout.tsx).
// Usage : SUPABASE_ACCESS_TOKEN=sbp_… node scripts/auth-emails.mjs [--dry]

const PROJECT = "tmhijqvuflokcsgcfolu";

function layout(label, title, body, cta) {
  return `<div style="background:#f3f3f2;padding:32px 12px;font-family:Inter,Helvetica,Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto">
    <p style="font-size:22px;font-weight:700;letter-spacing:-.04em;margin:0 0 16px 4px;color:#111">Navpit<span style="color:#9a9a9a">.</span></p>
    <div style="background:#fff;border:1px solid #ececeb;border-radius:24px;padding:32px 28px">
      <p style="font:500 11px Menlo,monospace;letter-spacing:.14em;color:#8c8c8c;text-transform:uppercase;margin:0">/ ${label} ///</p>
      <p style="font-size:26px;line-height:1.15;font-weight:600;letter-spacing:-.035em;color:#111;margin:10px 0 14px">${title}</p>
      <p style="font-size:15px;line-height:1.6;color:#555;margin:0 0 12px">${body}</p>
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;margin-top:12px;background:#111;color:#fff;border-radius:999px;padding:14px 24px;font-size:15px;text-decoration:none">${cta}</a>
      <p style="font-size:12.5px;line-height:1.5;color:#8c8c8c;margin:20px 0 0">Tu n’as rien demandé ? Ignore cet email, rien ne changera.</p>
    </div>
    <p style="font-size:12px;color:#8c8c8c;text-align:center;margin:16px 0 0">Navpit · Le cockpit des fondateurs solo</p>
  </div>
</div>`;
}

const config = {
  mailer_subjects_confirmation: "Confirme ton compte Navpit",
  mailer_templates_confirmation_content: layout(
    "Inscription",
    "Plus qu’un clic.",
    "Confirme ton adresse email pour activer ton cockpit Navpit.",
    "Confirmer mon email",
  ),
  mailer_subjects_magic_link: "Ton lien de connexion Navpit",
  mailer_templates_magic_link_content: layout(
    "Connexion",
    "Ton lien de connexion.",
    "Clique sur le bouton pour te connecter. Le lien marche une seule fois, pendant une heure.",
    "Me connecter",
  ),
  mailer_subjects_recovery: "Nouveau mot de passe Navpit",
  mailer_templates_recovery_content: layout(
    "Mot de passe",
    "Choisis un nouveau mot de passe.",
    "Tu as demandé à changer ton mot de passe. Le lien marche pendant une heure.",
    "Choisir mon mot de passe",
  ),
  mailer_subjects_email_change: "Confirme ta nouvelle adresse Navpit",
  mailer_templates_email_change_content: layout(
    "Email",
    "Confirme ta nouvelle adresse.",
    "Clique pour utiliser cette adresse email sur ton compte Navpit.",
    "Confirmer l’adresse",
  ),
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
