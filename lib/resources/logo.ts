import type { Resource } from "./types";

/** Clé publique logo.dev (pk_…), faite pour être visible côté navigateur. */
const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN ?? "";

/** Ressources sans lien, ou dont le lien pointe vers un hébergeur (GitHub) plutôt que vers la marque. */
const BY_NAME: [RegExp, string][] = [
  [/^claude/i, "claude.ai"],
  [/^cline/i, "cline.bot"],
  [/^cursor/i, "cursor.com"],
  [/^devis instant/i, "devisinstant.eu"],
];

function domainOf(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const parts = host.split(".");
    return parts.length > 2 ? parts.slice(-2).join(".") : host;
  } catch {
    return null;
  }
}

export function resourceLogoUrl(r: Pick<Resource, "name" | "url">) {
  if (!LOGO_DEV_TOKEN) return null;
  const domain = BY_NAME.find(([re]) => re.test(r.name))?.[1] ?? (r.url ? domainOf(r.url) : null);
  if (!domain) return null;
  return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=80&format=png&retina=true`;
}
