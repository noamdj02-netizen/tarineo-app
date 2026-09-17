import { ASSETS_EMAIL, origineEmail, urlAssetEmail } from "./assets";
import { echapperHtml } from "./escape";

export type VarianteBouton = "orange" | "dark";

const COULEUR_ORANGE = "#ec5821";
const COULEUR_DARK = "#14171e";
const COULEUR_TEXTE = "#43454b";
const COULEUR_TEXTE_MUTED = "#7b7d81";
const COULEUR_FOND_CARTE = "#f3f4f6";

const POLICE =
  "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/** Styles responsive — clients mail modernes (Gmail iOS/Android, Apple Mail). */
const STYLES_RESPONSIVE = `
  :root { color-scheme: light; supported-color-schemes: light; }
  @media only screen and (max-width: 600px) {
    .email-outer { padding: 20px 16px 40px !important; }
    .email-header-table { margin-bottom: 20px !important; }
    .email-header-cell { padding: 0 !important; }
    .email-header-tagline { display: none !important; max-height: 0 !important; overflow: hidden !important; mso-hide: all; }
    .email-card { padding: 36px 20px 40px !important; border-radius: 12px !important; }
    .email-section { margin-bottom: 32px !important; }
    .email-title { font-size: 24px !important; line-height: 1.25 !important; margin-bottom: 20px !important; }
    .email-body-wrap { max-width: 100% !important; }
    .email-btn-table { width: 100% !important; }
    .email-btn-link { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; padding: 14px 20px !important; font-size: 15px !important; }
    .email-mascot img { width: 160px !important; height: auto !important; }
    .email-footer { width: 100% !important; max-width: 100% !important; }
    .email-footer-text { padding-left: 8px !important; padding-right: 8px !important; }
  }
`;

function couleurBouton(variante: VarianteBouton): string {
  return variante === "orange" ? COULEUR_ORANGE : COULEUR_DARK;
}

export function bouton(href: string, label: string, variante: VarianteBouton = "orange"): string {
  const bg = couleurBouton(variante);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="email-btn-table" width="100%" style="margin:0 auto;max-width:320px;">
      <tr>
        <td align="center" style="border-radius:12px;background:${bg};">
          <a href="${href}" target="_blank" class="email-btn-link" style="display:inline-block;padding:14px 28px;font-family:${POLICE};font-size:16px;font-weight:500;line-height:1.5;color:#ffffff;text-decoration:none;border-radius:12px;letter-spacing:-0.048px;">
            ${echapperHtml(label)}
          </a>
        </td>
      </tr>
    </table>`;
}

function enTete(origine?: string): string {
  const logo = urlAssetEmail(ASSETS_EMAIL.logo, origine);
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-header-table" style="margin-bottom:32px;">
      <tr>
        <td align="left" valign="middle" class="email-header-cell">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="middle" style="padding-right:8px;">
                <img src="${logo}" width="27" height="28" alt="Tarineo" style="display:block;border:0;" />
              </td>
              <td valign="middle" style="font-family:${POLICE};font-size:17.5px;font-weight:550;color:${COULEUR_DARK};letter-spacing:-0.525px;">
                Tarineo
              </td>
            </tr>
          </table>
        </td>
        <td align="right" valign="middle" class="email-header-tagline email-header-cell" style="font-family:${POLICE};font-size:13px;line-height:1.5;letter-spacing:-0.039px;">
          <span style="color:${COULEUR_TEXTE_MUTED};">Vos devis sous surveillance avec</span>
          <span style="color:${COULEUR_TEXTE};"> Tarineo</span>
        </td>
      </tr>
    </table>`;
}

function piedDePage(origine?: string, urlDesinscription?: string): string {
  const liens = [
    { href: "https://x.com/tarineo", src: ASSETS_EMAIL.socialX, alt: "X" },
    { href: "https://www.linkedin.com/company/tarineo", src: ASSETS_EMAIL.socialLinkedin, alt: "LinkedIn" },
    { href: "https://www.youtube.com/@tarineo", src: ASSETS_EMAIL.socialYoutube, alt: "YouTube" },
    { href: "https://github.com/tarineo", src: ASSETS_EMAIL.socialGithub, alt: "GitHub" },
  ];

  const icones = liens
    .map(
      (l) =>
        `<td style="padding:0 16px;"><a href="${l.href}" target="_blank"><img src="${urlAssetEmail(l.src, origine)}" width="20" height="20" alt="${l.alt}" style="display:block;border:0;" /></a></td>`,
    )
    .join("");

  const desinscription = urlDesinscription
    ? `<a href="${urlDesinscription}" style="color:${COULEUR_TEXTE_MUTED};text-decoration:underline;">Se désinscrire des emails marketing Tarineo.</a>`
    : `Se désinscrire des emails marketing Tarineo.`;

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-footer" style="margin:0 auto;max-width:544px;">
      <tr>
        <td align="center" class="email-footer-text" style="padding-bottom:32px;font-family:${POLICE};font-size:13px;line-height:1.5;color:${COULEUR_TEXTE_MUTED};letter-spacing:-0.039px;max-width:302px;">
          Tarineo détecte les hausses de prix chez vos fournisseurs BTP, avant qu'elles ne rognent votre marge.
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom:32px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>${icones}</tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="font-family:${POLICE};font-size:11px;line-height:1.5;color:${COULEUR_TEXTE_MUTED};letter-spacing:-0.033px;">
          <p style="margin:0 0 24px;">Tarineo SAS — 12 rue des Artisans<br/>76000 Rouen, France</p>
          <p style="margin:0;">${desinscription}</p>
        </td>
      </tr>
    </table>`;
}

function logoCentre(origine?: string): string {
  const logo = urlAssetEmail(ASSETS_EMAIL.logo, origine);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 24px;">
      <tr>
        <td align="center" width="48" height="48" style="padding:12px;">
          <img src="${logo}" width="44" height="44" alt="" style="display:block;border:0;" />
        </td>
      </tr>
    </table>`;
}

/** Mascotte 3D pouce levé — email activation (Figma 178:28332). */
function mascotteActivation(origine?: string): string {
  const src = urlAssetEmail(ASSETS_EMAIL.activationMascot, origine);
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="email-mascot" style="margin:0 auto 20px;">
      <tr>
        <td align="center">
          <img src="${src}" width="204" height="170" alt="" style="display:block;border:0;width:204px;height:auto;max-width:100%;" />
        </td>
      </tr>
    </table>`;
}

function noteBas(lignes: string[]): string {
  const contenu = lignes
    .map(
      (l, i) =>
        `<p style="margin:0${i < lignes.length - 1 ? " 0 0" : ""};font-family:${POLICE};font-size:13px;line-height:1.5;color:${COULEUR_TEXTE_MUTED};letter-spacing:-0.039px;text-align:center;">${echapperHtml(l)}</p>`,
    )
    .join("");
  return `<div style="max-width:390px;margin:0 auto;">${contenu}</div>`;
}

function noteBasActivation(lignes: string[]): string {
  const contenu = lignes
    .map(
      (l, i) =>
        `<p style="margin:0${i < lignes.length - 1 ? " 0 0" : ""};font-family:${POLICE};font-size:14px;line-height:1.5;color:${COULEUR_TEXTE_MUTED};letter-spacing:-0.042px;text-align:center;">${echapperHtml(l)}</p>`,
    )
    .join("");
  return contenu;
}

export interface OptionsCarte {
  titre: string;
  paragraphes: string[];
  bouton?: { href: string; label: string; variante?: VarianteBouton };
  note?: string[];
  origine?: string;
  urlDesinscription?: string;
}

/** Layout « password-reset » : carte centrée avec logo, titre, corps, bouton, note. */
export function layoutCarte(options: OptionsCarte): string {
  const { titre, paragraphes, bouton: btn, note, origine, urlDesinscription } = options;

  const corps = paragraphes
    .map(
      (p, i) =>
        `<p style="margin:0 0 ${i < paragraphes.length - 1 ? "12px" : "0"};font-family:${POLICE};font-size:16px;line-height:1.5;color:${COULEUR_DARK};opacity:0.8;text-align:center;letter-spacing:-0.048px;">${p}</p>`,
    )
    .join("");

  const boutonHtml = btn ? `<div style="margin-top:32px;">${bouton(btn.href, btn.label, btn.variante ?? "orange")}</div>` : "";

  const noteHtml = note?.length ? `<div style="margin-top:40px;">${noteBas(note)}</div>` : "";

  const contenu = `
    ${logoCentre(origine)}
    <h1 class="email-title" style="margin:0 0 24px;font-family:${POLICE};font-size:28px;font-weight:600;line-height:normal;color:${COULEUR_DARK};text-align:center;letter-spacing:-0.084px;">${echapperHtml(titre)}</h1>
    <div style="margin-bottom:0;">${corps}</div>
    ${boutonHtml}
    ${noteHtml}`;

  return enveloppe(
    `
    ${enTete(origine)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-section" style="margin-bottom:56px;">
      <tr>
        <td class="email-card" style="background:${COULEUR_FOND_CARTE};border-radius:16px;padding:56px 48px;">
          ${contenu}
        </td>
      </tr>
    </table>
    ${piedDePage(origine, urlDesinscription)}`,
    origine,
  );
}

export interface OptionsActivation extends OptionsCarte {
  /** Par défaut true : texte corps aligné centre comme Figma activation. */
  corpsCentre?: boolean;
  /** Illustration en tête de carte — mascotte réservée à l'email activation (178:28332). */
  illustration?: "mascotte" | "logo";
}

/** Layout « activation » — Figma 178:28332 : mascotte, titre, corps, CTA orange, note. */
export function layoutActivation(options: OptionsActivation): string {
  const {
    titre,
    paragraphes,
    bouton: btn,
    note,
    origine,
    urlDesinscription,
    corpsCentre = true,
    illustration = "logo",
  } = options;

  const align = corpsCentre ? "center" : "left";
  const corps = paragraphes
    .map(
      (p, i) =>
        `<p style="margin:0 0 ${i < paragraphes.length - 1 ? "16px" : "0"};font-family:${POLICE};font-size:16px;font-weight:500;line-height:1.5;color:${COULEUR_TEXTE};text-align:${align};letter-spacing:-0.048px;">${p}</p>`,
    )
    .join("");

  const boutonHtml = btn
    ? `<div style="margin-top:24px;text-align:center;">${bouton(btn.href, btn.label, btn.variante ?? "orange")}</div>`
    : "";

  const noteHtml = note?.length ? `<div style="margin-top:40px;">${noteBasActivation(note)}</div>` : "";

  const illustrationHtml =
    illustration === "mascotte" ? mascotteActivation(origine) : logoCentre(origine);

  const contenu = `
    ${illustrationHtml}
    <h1 class="email-title" style="margin:0 0 24px;font-family:${POLICE};font-size:28px;font-weight:600;line-height:normal;color:${COULEUR_DARK};text-align:center;letter-spacing:-0.084px;">${echapperHtml(titre)}</h1>
    <div class="email-body-wrap" style="max-width:376px;margin:0 auto;">${corps}</div>
    ${boutonHtml}
    ${noteHtml}`;

  return enveloppe(
    `
    ${enTete(origine)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-section" style="margin-bottom:56px;">
      <tr>
        <td class="email-card" style="background:${COULEUR_FOND_CARTE};border-radius:16px;padding:56px 48px;">
          ${contenu}
        </td>
      </tr>
    </table>
    ${piedDePage(origine, urlDesinscription)}`,
    origine,
  );
}

export interface OptionsTexte {
  titre: string;
  paragraphes: string[];
  bouton?: { href: string; label: string; variante?: VarianteBouton };
  signature?: string[];
  origine?: string;
  urlDesinscription?: string;
}

/** Layout « text » : grand titre aligné à gauche + signature fondateurs. */
export function layoutTexte(options: OptionsTexte): string {
  const { titre, paragraphes, bouton: btn, signature, origine, urlDesinscription } = options;

  const corps = paragraphes
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-family:${POLICE};font-size:16px;line-height:1.5;color:${COULEUR_TEXTE};letter-spacing:-0.048px;">${p}</p>`,
    )
    .join("");

  const boutonHtml = btn ? `<div style="margin-top:32px;">${bouton(btn.href, btn.label, btn.variante ?? "orange")}</div>` : "";

  const signatureHtml = signature?.length
    ? `<div style="margin-top:40px;font-family:${POLICE};font-size:16px;line-height:1.5;color:${COULEUR_TEXTE};letter-spacing:-0.048px;">${signature.map((l) => `<p style="margin:0 0 4px;">${echapperHtml(l)}</p>`).join("")}</div>`
    : "";

  return enveloppe(
    `
    ${enTete(origine)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-section" style="margin-bottom:56px;">
      <tr>
        <td class="email-card" style="background:${COULEUR_FOND_CARTE};border-radius:16px;padding:56px 48px;">
          <h1 class="email-title" style="margin:0 0 32px;font-family:${POLICE};font-size:40px;font-weight:600;line-height:1.1;color:${COULEUR_DARK};letter-spacing:-0.8px;">${echapperHtml(titre)}</h1>
          ${corps}
          ${boutonHtml}
          ${signatureHtml}
        </td>
      </tr>
    </table>
    ${piedDePage(origine, urlDesinscription)}`,
    origine,
  );
}

function imageBloc(src: string, hauteur: number, borderRadius = 12): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
      <tr>
        <td>
          <img src="${src}" width="544" alt="" style="display:block;width:100%;max-width:544px;height:${hauteur}px;object-fit:cover;border-radius:${borderRadius}px;border:0;" />
        </td>
      </tr>
    </table>`;
}

function titreSection(texte: string, taille = 40): string {
  return `<h2 style="margin:0 0 32px;font-family:${POLICE};font-size:${taille}px;font-weight:600;line-height:1.1;color:${COULEUR_DARK};text-align:center;letter-spacing:${taille >= 40 ? "-0.8px" : "-0.096px"};">${echapperHtml(texte)}</h2>`;
}

function puceOrange(): string {
  return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${COULEUR_ORANGE};margin-right:12px;vertical-align:middle;"></span>`;
}

/** Newsletter « Notes de version » (feature-announcement). */
export function layoutNotesDeVersion(params: {
  urlEssayer: string;
  urlTableauDeBord: string;
  origine?: string;
  urlDesinscription?: string;
}): string {
  const { urlEssayer, urlTableauDeBord, origine, urlDesinscription } = params;
  const o = origine;

  const sectionFeature = (
    image: string,
    titre: string,
    paragraphes: string[],
    btnHref: string,
    btnVariante: VarianteBouton,
  ) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:64px;">
      <tr><td>${imageBloc(urlAssetEmail(image, o), 340)}</td></tr>
      <tr><td>
        <h3 style="margin:0 0 32px;font-family:${POLICE};font-size:40px;font-weight:600;line-height:1.1;color:${COULEUR_DARK};letter-spacing:-0.8px;">${echapperHtml(titre)}</h3>
        ${paragraphes.map((p) => `<p style="margin:0 0 16px;font-family:${POLICE};font-size:16px;line-height:1.5;color:${COULEUR_TEXTE};letter-spacing:-0.048px;">${p}</p>`).join("")}
        <div style="margin-top:32px;">${bouton(btnHref, "Essayer maintenant", btnVariante)}</div>
      </td></tr>
    </table>`;

  const listeItem = (titre: string, texte: string, lien?: string) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:40px;">
      <tr>
        <td width="72" valign="top">
          <div style="width:72px;height:72px;border-radius:16px;background:${COULEUR_ORANGE};"></div>
        </td>
        <td valign="top" style="padding-left:40px;">
          <p style="margin:0 0 8px;font-family:${POLICE};font-size:20px;font-weight:600;line-height:1.5;color:${COULEUR_DARK};letter-spacing:-0.06px;">${echapperHtml(titre)}</p>
          <p style="margin:0 0 8px;font-family:${POLICE};font-size:16px;line-height:1.5;color:${COULEUR_TEXTE};letter-spacing:-0.048px;">${texte}</p>
          ${lien ? `<p style="margin:0;font-family:${POLICE};font-size:16px;line-height:1.5;color:${COULEUR_TEXTE};">${echapperHtml(lien)}</p>` : ""}
        </td>
      </tr>
    </table>`;

  const corps = `
    ${enTete(o)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="background:${COULEUR_FOND_CARTE};border-radius:16px;padding:72px 24px 64px;">
          <p style="margin:0 0 24px;font-family:${POLICE};font-size:13px;font-weight:500;color:${COULEUR_TEXTE_MUTED};text-align:center;letter-spacing:-0.039px;">Nouveau chez Tarineo</p>
          ${titreSection("Notes de version")}
          <p style="margin:0 0 64px;font-family:${POLICE};font-size:16px;line-height:1.5;color:${COULEUR_TEXTE};text-align:center;letter-spacing:-0.048px;">Voici ce qui arrive ce mois-ci, ainsi que les autres mises à jour Tarineo.</p>

          ${sectionFeature(
            ASSETS_EMAIL.featureComparator,
            "Le comparateur multi-fournisseurs arrive",
            [
              "Comparez en un clic les prix de Cedeo, Point P et Rexel sur vos références les plus commandées. Fini les allers-retours entre trois devis pour repérer qui a augmenté ses tarifs.",
              "Chaque écart de prix est mis en évidence directement dans votre tableau de bord, avec la référence produit et la date du dernier achat.",
            ],
            urlEssayer,
            "orange",
          )}

          ${sectionFeature(
            ASSETS_EMAIL.featureExport,
            "Un récapitulatif prêt pour la négociation",
            [
              "Générez en un clic un export chiffré des hausses détectées sur une période donnée, à présenter directement à votre commercial fournisseur.",
              "Moins de temps passé à recouper les devis, plus de temps pour négocier vos prix d'achat.",
            ],
            urlEssayer,
            "dark",
          )}
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="background:${COULEUR_FOND_CARTE};border-radius:16px;padding:72px 32px;">
          ${titreSection("De nouvelles façons de travailler avec Tarineo", 40)}
          ${listeItem(
            "Des automatisations qui font gagner du temps",
            "Centralisez vos devis fournisseurs au même endroit, supprimez les ressaisies manuelles et donnez à toute l'équipe la même source de vérité sur les prix d'achat.",
            "Lire la suite",
          )}
          ${listeItem(
            "Une vue plus claire de vos besoins chantier",
            "Suivez les commandes en cours et à venir par chantier, et anticipez les hausses de prix avant qu'elles n'impactent votre marge.",
            "Lire la suite",
          )}
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="background:${COULEUR_FOND_CARTE};border-radius:16px;padding:24px 24px 64px;">
          ${sectionFeature(
            ASSETS_EMAIL.featureMobile,
            "L'appli mobile Tarineo débarque",
            [
              "Scannez un devis directement depuis le chantier, sans attendre de repasser au bureau. La photo suffit, Tarineo fait le reste.",
              "Vos alertes de hausse de prix vous suivent partout, en push notification sur votre téléphone.",
            ],
            urlEssayer,
            "dark",
          )}
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:64px;">
      <tr>
        <td align="center" style="padding:72px 0;">
          <img src="${urlAssetEmail(ASSETS_EMAIL.featureCtaIcon, o)}" width="56" height="56" alt="" style="display:block;margin:0 auto 32px;border-radius:16px;border:0;" />
          <p style="margin:0 0 32px;font-family:${POLICE};font-size:28px;font-weight:600;line-height:normal;color:${COULEUR_TEXTE};text-align:center;letter-spacing:-0.084px;max-width:480px;">
            Commencez à utiliser Tarineo<br/>Le moyen le plus rapide de reprendre la main sur vos prix d'achat.
          </p>
          ${bouton(urlTableauDeBord, "Accéder à mon tableau de bord", "orange")}
        </td>
      </tr>
    </table>

    ${piedDePage(o, urlDesinscription)}`;

  return enveloppe(corps, o);
}

/** Newsletter « Bienvenue » (welcome). */
export function layoutBienvenue(params: {
  urlTableauDeBord: string;
  origine?: string;
  urlDesinscription?: string;
}): string {
  const { urlTableauDeBord, origine, urlDesinscription } = params;
  const o = origine;

  const featurePuce = (texte: string) => `
    <td width="50%" valign="top" style="padding:0 10px 20px 0;font-family:${POLICE};font-size:16px;line-height:1.5;color:${COULEUR_TEXTE};letter-spacing:-0.048px;">
      ${puceOrange()}${texte}
    </td>`;

  const colonneFeature = (image: string, titre: string, texte: string) => `
    <td width="50%" valign="top" style="padding:0 6px;">
      <img src="${urlAssetEmail(image, o)}" width="248" alt="" style="display:block;width:100%;max-width:248px;height:242px;object-fit:cover;border-radius:12px;border:0;margin-bottom:24px;" />
      <p style="margin:0 0 4px;font-family:${POLICE};font-size:16px;font-weight:600;line-height:1.5;color:${COULEUR_DARK};">${echapperHtml(titre)}</p>
      <p style="margin:0;font-family:${POLICE};font-size:16px;line-height:1.5;color:${COULEUR_TEXTE};">${texte}</p>
    </td>`;

  const corps = `
    ${enTete(o)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="background:${COULEUR_FOND_CARTE};border-radius:16px;padding:24px 24px 48px;">
          ${imageBloc(urlAssetEmail(ASSETS_EMAIL.welcomeHero, o), 380, 23)}
          ${titreSection("Bienvenue sur Tarineo")}
          <p style="margin:0 0 32px;font-family:${POLICE};font-size:16px;line-height:1.5;color:${COULEUR_DARK};opacity:0.8;text-align:center;letter-spacing:-0.048px;">
            Votre compte est prêt. Importez vos premiers devis fournisseurs pour que Tarineo commence à surveiller vos prix d'achat BTP (Cedeo, Point P, Rexel...) et repère les hausses avant qu'elles ne passent inaperçues.
          </p>
          ${bouton(urlTableauDeBord, "Accéder à mon tableau de bord", "orange")}
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="background:${COULEUR_FOND_CARTE};border-radius:16px;padding:20px 20px 56px;">
          ${imageBloc(urlAssetEmail(ASSETS_EMAIL.welcomeUpload, o), 320)}
          <h2 style="margin:0 0 40px;font-family:${POLICE};font-size:32px;font-weight:600;color:${COULEUR_DARK};text-align:center;letter-spacing:-0.096px;">Pour bien démarrer</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px;">
            <tr>
              ${featurePuce("Importez vos devis et factures fournisseurs par photo, PDF ou email — Tarineo les lit et les classe automatiquement.")}
              ${featurePuce("Chaque nouveau document est comparé à votre historique d'achat pour repérer tout écart de prix anormal.")}
            </tr>
            <tr>
              ${featurePuce("Recevez une alerte dès qu'une hausse est détectée, avec l'historique chiffré à l'appui pour négocier.")}
              ${featurePuce("Invitez votre équipe (achats, chantier) pour centraliser le suivi fournisseurs au même endroit.")}
            </tr>
          </table>
          ${bouton(urlTableauDeBord, "Accéder à mon tableau de bord", "dark")}
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="background:${COULEUR_FOND_CARTE};border-radius:16px;padding:56px 24px;">
          <h2 style="margin:0 0 64px;font-family:${POLICE};font-size:32px;font-weight:600;color:${COULEUR_DARK};text-align:center;letter-spacing:-0.096px;">Ce que Tarineo surveille pour vous</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:56px;">
            <tr>
              ${colonneFeature(
                ASSETS_EMAIL.welcomeScan,
                "Scan intelligent des devis",
                "Photo, PDF ou mail : Tarineo extrait automatiquement les lignes de prix, quantités et références produit.",
              )}
              ${colonneFeature(
                ASSETS_EMAIL.welcomeAlerts,
                "Alertes de hausse de prix",
                "Dès qu'un prix fournisseur augmente par rapport à votre historique, vous êtes prévenu avec le détail chiffré.",
              )}
            </tr>
          </table>
          ${bouton(urlTableauDeBord, "Découvrir", "dark")}
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:64px;">
      <tr>
        <td align="center" style="padding:72px 0;">
          <img src="${urlAssetEmail(ASSETS_EMAIL.welcomeCtaIcon, o)}" width="56" height="56" alt="" style="display:block;margin:0 auto 32px;border-radius:16px;border:0;" />
          <p style="margin:0 0 8px;font-family:${POLICE};font-size:28px;font-weight:600;color:${COULEUR_TEXTE};text-align:center;letter-spacing:-0.084px;">Commencez à négocier avec des chiffres</p>
          <p style="margin:0 0 32px;font-family:${POLICE};font-size:28px;font-weight:600;color:${COULEUR_TEXTE};text-align:center;letter-spacing:-0.084px;">Tarineo transforme chaque devis reçu en levier de négociation.</p>
          ${bouton(urlTableauDeBord, "Accéder à mon tableau de bord", "orange")}
        </td>
      </tr>
    </table>

    ${piedDePage(o, urlDesinscription)}`;

  return enveloppe(corps, o);
}

export function enveloppe(corps: string, _origine?: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Tarineo</title>
  <style type="text/css">${STYLES_RESPONSIVE}</style>
  <!--[if mso]><style>body,table,td{font-family:Arial,Helvetica,sans-serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:${POLICE};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
    <tr>
      <td align="center" class="email-outer" style="padding:40px 32px 56px;">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;">
          <tr>
            <td>${corps}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export { origineEmail, urlAssetEmail };
