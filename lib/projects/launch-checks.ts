export type LaunchGroup = "tech" | "legal" | "seo" | "ops";

export const LAUNCH_GROUP_LABEL: Record<LaunchGroup, string> = {
  tech: "Tech",
  legal: "Légal",
  seo: "SEO",
  ops: "Mise en ligne",
};

export type LaunchCheck = {
  id: string;
  n: string;
  group: LaunchGroup;
  hint: string;
  prompt: (name: string) => string;
};

export type LaunchState = { done: string[] };

export type LaunchTip = { id: string; hint: string; prompt: string };

const KEY = "__launch";

const IDS = new Set<string>();

function item(
  id: string,
  n: string,
  group: LaunchGroup,
  hint: string,
  prompt: (name: string) => string,
): LaunchCheck {
  IDS.add(id);
  return { id, n, group, hint, prompt };
}

function ask(name: string, job: string) {
  return `Projet ${name}. ${job} Fais le geste (texte, tâche ou next). Pas de pavé.`;
}

export const LAUNCH_CHECKS: LaunchCheck[] = [
  item("https", "Force le HTTPS", "tech", "Oublie pas le HTTPS partout, y compris les redirects.", (name) =>
    ask(name, "Vérifie que le site est en HTTPS et que http redirige. Si l’URL manque, demande-la. Crée une tâche « Forcer HTTPS »."),
  ),
  item("api-keys", "Clés API hors front", "tech", "Oublie pas : aucune clé secrète dans le navigateur.", (name) =>
    ask(name, "Liste les clés à sortir du front (Stripe, Anthropic, Supabase service). Écris une checklist de 4 lignes et une tâche."),
  ),
  item("legal", "Mentions légales", "legal", "Oublie pas la page mentions légales avant d’ouvrir au public.", (name) =>
    ask(name, "Rédige les mentions légales (éditeur, hébergeur, contact) prêtes à coller. Ton factuel."),
  ),
  item("backups", "Sauvegardes auto", "tech", "Oublie pas une sauvegarde qui tourne sans toi.", (name) =>
    ask(name, "Propose le plan de backup (base + fichiers) en 3 lignes et crée la tâche."),
  ),
  item("privacy", "Page confidentialité", "legal", "Oublie pas la page confidentialité (RGPD).", (name) =>
    ask(name, "Rédige une page confidentialité courte : données, cookies, droits, contact."),
  ),
  item("cgu", "Page de CGU", "legal", "Oublie pas les CGU / CGV avant le premier paiement.", (name) =>
    ask(name, "Rédige des CGU/CGV courtes pour un SaaS solo : offre, paiement, résiliation."),
  ),
  item("cookies", "Bandeau cookies", "legal", "Oublie pas le bandeau cookies si tu charges un tracker.", (name) =>
    ask(name, "Écris le texte du bandeau cookies (essentiels / tout accepter) et où le poser."),
  ),
  item("responsive", "Site responsive", "tech", "Oublie pas de tester le site sur téléphone.", (name) =>
    ask(name, "Donne 4 points à tester sur mobile (hero, CTA, formulaires, nav) et une tâche."),
  ),
  item("contrast", "Contraste couleurs", "tech", "Oublie pas le contraste : le texte doit se lire.", (name) =>
    ask(name, "Rappelle la règle AA et les 3 endroits à vérifier (hero, boutons, footer). Tâche si besoin."),
  ),
  item("images", "Images + vitesse", "tech", "Oublie pas de compresser les images avant la mise en ligne.", (name) =>
    ask(name, "Check vitesse : formats, lazy-load, hero trop lourd. 3 actions max."),
  ),
  item("title-desc", "Meta title + desc", "seo", "Oublie pas title et description uniques.", (name) =>
    ask(name, "Écris title (≤60) et meta description (≤155) pour la home, copy réelle."),
  ),
  item("alts", "Textes alternatifs", "seo", "Oublie pas les alt sur les photos utiles.", (name) =>
    ask(name, "Règle des alt : utiles, pas de keyword stuffing. 3 exemples pour ce projet."),
  ),
  item("sitemap", "Sitemap + robots.txt", "seo", "Oublie pas sitemap.xml et robots.txt à la racine.", (name) =>
    ask(name, "Écris un robots.txt + indique l’URL du sitemap. Tâche « Publier sitemap »."),
  ),
  item("gsc", "Search Console", "seo", "Oublie pas d’ajouter le site dans Search Console.", (name) =>
    ask(name, "Explique en 4 lignes comment coller la propriété GSC sur la fiche projet, puis ouvre #seo."),
  ),
  item("favicon", "Favicon", "seo", "Oublie pas le favicon (onglet + signet).", (name) =>
    ask(name, "Dis où poser favicon.ico / apple-touch et crée la tâche si elle manque."),
  ),
  item("og", "Image réseaux", "seo", "Oublie pas l’image Open Graph pour les partages.", (name) =>
    ask(name, "Brief de l’image OG 1200×630 : texte, fond, pas de faux dashboard. Tâche."),
  ),
  item("links-404", "Liens + page 404", "tech", "Oublie pas une 404 utile et des liens qui marchent.", (name) =>
    ask(name, "Texte de la 404 (une phrase + CTA) et rappelle de tester les liens internes."),
  ),
  item("antispam", "Anti-spam", "tech", "Oublie pas un filet anti-spam sur les formulaires.", (name) =>
    ask(name, "Propose le filet anti-spam (honeypot ou Turnstile) et une tâche."),
  ),
  item("analytics", "Outil d’analytics", "seo", "Oublie pas de lier GA4 (ou un outil) avant le trafic.", (name) =>
    ask(name, "Dis comment coller l’ID G-XXXXXXXX dans le score SEO du projet. Pas le snippet entier."),
  ),
  item("cta", "Un seul CTA", "seo", "Oublie pas : un seul CTA principal, même texte partout.", (name) =>
    ask(name, "Propose UN CTA (5 mots max) et où il se répète. Écris-le dans le marketing si vide."),
  ),
  item("vercel-env", "Variables Vercel", "ops", "Oublie pas les env Vercel (jamais dans le repo).", (name) =>
    ask(name, "Liste les variables à poser sur Vercel (ANTHROPIC, Stripe, Supabase, Resend). Aucune clé dans le front. Tâche « Coller les env »."),
  ),
  item("domain", "Nom de domaine validé", "ops", "Oublie pas de valider le domaine (DNS + SSL).", (name) =>
    ask(name, "Check domaine : DNS A/CNAME vers Vercel, SSL vert, www → apex. Crée la tâche manquante."),
  ),
  item("mobile-real", "Test mobile réel", "ops", "Oublie pas de tester sur un vrai téléphone avant le lancement.", (name) =>
    ask(name, "4 pièges mobile SaaS : clavier qui cache le CTA, tap trop petit, hero trop lourd, formulaire. Tâche « Test iPhone + Android »."),
  ),
  item("stripe-live", "Checkout Stripe live", "ops", "Oublie pas de passer Stripe en live avant le premier client.", (name) =>
    ask(name, "Rappelle le passage test → live (clé restreinte, webhook, page succès). Tâche « Activer Stripe live »."),
  ),
  item("dns-mail", "DNS mail (SPF/DKIM)", "ops", "Oublie pas SPF/DKIM sinon les mails tombent en spam.", (name) =>
    ask(name, "Si Resend : 3 lignes SPF/DKIM/DMARC à coller chez le registrar. Tâche."),
  ),
  item("errors", "Erreurs en prod", "ops", "Oublie pas un filet d’erreurs (Sentry ou équivalent) dès le jour 1.", (name) =>
    ask(name, "Dis où brancher Sentry (env Vercel) et crée la tâche. Pas de roman."),
  ),
];

export const EMPTY_LAUNCH: LaunchState = { done: [] };

export function launchFromBusiness(business: Record<string, string> | null | undefined): LaunchState {
  const raw = business?.[KEY];
  if (!raw) return { done: [] };
  try {
    const parsed = JSON.parse(raw) as { done?: unknown };
    const done = Array.isArray(parsed.done)
      ? parsed.done.filter((id): id is string => typeof id === "string" && IDS.has(id))
      : [];
    return { done: [...new Set(done)] };
  } catch {
    return { done: [] };
  }
}

export function mergeLaunch(
  business: Record<string, string> | null | undefined,
  state: LaunchState,
) {
  const done = [...new Set(state.done.filter((id) => IDS.has(id)))];
  return { ...(business ?? {}), [KEY]: JSON.stringify({ done }) };
}

export function remainingChecks(done: string[]) {
  const set = new Set(done);
  return LAUNCH_CHECKS.filter((c) => !set.has(c.id));
}

export function checksByGroup() {
  return (["tech", "legal", "seo", "ops"] as const).map((id) => ({
    id,
    n: LAUNCH_GROUP_LABEL[id],
    items: LAUNCH_CHECKS.filter((c) => c.group === id),
  }));
}

export function liveTips(input: {
  name: string;
  site: string;
  gaId: string;
  gsc: string;
  stripe: boolean;
}): LaunchTip[] {
  const tips: LaunchTip[] = [];
  const site = input.site.trim();
  if (site && !site.startsWith("https://")) {
    tips.push({
      id: "live-https",
      hint: "Oublie pas : le site n’est pas en HTTPS.",
      prompt: LAUNCH_CHECKS[0].prompt(input.name),
    });
  }
  if (!input.stripe) {
    tips.push({
      id: "live-stripe",
      hint: "Oublie pas les clés Stripe (restreinte, jamais dans le front).",
      prompt: ask(
        input.name,
        "Rappelle comment lier Stripe depuis /outils (clé restreinte) et crée une tâche « Lier Stripe ».",
      ),
    });
  }
  if (!input.gaId) {
    tips.push({
      id: "live-ga",
      hint: "Oublie pas de coller l’ID GA4 sur la fiche.",
      prompt: LAUNCH_CHECKS.find((c) => c.id === "analytics")!.prompt(input.name),
    });
  }
  if (!input.gsc) {
    tips.push({
      id: "live-gsc",
      hint: "Oublie pas Search Console sur ce domaine.",
      prompt: LAUNCH_CHECKS.find((c) => c.id === "gsc")!.prompt(input.name),
    });
  }
  return tips;
}

export function pickAdvice(
  name: string,
  done: string[],
  tips: LaunchTip[],
): LaunchTip {
  if (tips[0]) return tips[0];
  const next = remainingChecks(done)[0];
  if (next) return { id: next.id, hint: next.hint, prompt: next.prompt(name) };
  return {
    id: "done",
    hint: `Les ${LAUNCH_CHECKS.length} points sont cochés. Tu peux lancer.`,
    prompt: ask(name, "Les checks lancement sont faits. Donne la prochaine action pour la première vente."),
  };
}
