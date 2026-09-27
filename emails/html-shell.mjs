/** HTML transactionnel Navpit (Supabase Auth + Edge). Garder aligné avec emails/shell.tsx */

const DEFAULT_APP = "https://www.tarineo.fr";
const LOGO = `${DEFAULT_APP}/brand/tarineo-logo.png`;

/**
 * @param {{
 *   label: string;
 *   title: string;
 *   body: string;
 *   ctaHref?: string;
 *   ctaLabel?: string;
 *   code?: string;
 *   footer?: string;
 *   appUrl?: string;
 * }} opts
 */
export function navpitTransactionalHtml(opts) {
  const appUrl = (opts.appUrl ?? DEFAULT_APP).replace(/\/$/, "");
  const mascot = `${appUrl}/brand/tarineo-logo.png`;
  const button =
    opts.ctaHref && opts.ctaLabel
      ? `<a href="${opts.ctaHref}" style="display:inline-block;margin-top:16px;background:#111;color:#fff;border-radius:999px;padding:14px 28px;font-size:15px;font-weight:500;text-decoration:none">${opts.ctaLabel}</a>`
      : "";
  const codeBlock = opts.code
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px"><tr>
         <td style="background:#fff;border:1px solid #ececeb;border-radius:16px;padding:18px 28px;text-align:center">
           <p style="margin:0;font:600 32px/1 'Space Grotesk',Helvetica,Arial,sans-serif;letter-spacing:.28em;color:#111">${opts.code}</p>
         </td></tr></table>
       <p style="font-size:13px;line-height:1.5;color:#8c8c8c;margin:0 0 12px">Entre ce code sur Tarinéo, ou clique le bouton. Valable une heure.</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#e8e7e5;font-family:Inter,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e8e7e5;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#f3f3f2">
        <tr><td style="padding:24px 24px 8px">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:12px;vertical-align:middle"><img src="${mascot}" alt="" width="36" height="36" style="display:block;border-radius:8px" /></td>
            <td style="vertical-align:middle;font-size:22px;font-weight:700;letter-spacing:-.04em;color:#111">Tarinéo<span style="color:#8c8c8c">.</span></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:32px 24px 40px">
          <p style="font:500 11px Menlo,monospace;letter-spacing:.14em;color:#8c8c8c;text-transform:uppercase;margin:0">/ ${opts.label} ///</p>
          <p style="font:600 40px/1.02 'Space Grotesk',Helvetica,sans-serif;text-transform:uppercase;letter-spacing:-.04em;color:#111;margin:16px 0 0;max-width:490px">${opts.title}</p>
          <p style="font-size:15px;line-height:1.65;color:#555;margin:24px 0 0;max-width:490px">${opts.body}</p>
          ${codeBlock}
          ${button}
        </td></tr>
        <tr><td style="padding:0 24px 32px">
          <img src="${mascot}" alt="" width="592" style="display:block;width:100%;max-width:592px;border-radius:20px;border:1px solid #ececeb;background:#fff" />
        </td></tr>
        <tr><td style="border-top:1px solid #ececeb;padding:40px 24px">
          <p style="font-size:13px;line-height:1.55;color:#555;margin:0;max-width:320px">${opts.footer ?? "Tarinéo : déposez un devis, rangez-le par chantier, renvoyez la pièce au client."}</p>
          <p style="font-size:11px;color:#8c8c8c;margin:20px 0 0">Tu n’as rien demandé ? Ignore cet email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export { DEFAULT_APP, LOGO };
