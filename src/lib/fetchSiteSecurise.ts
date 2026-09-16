// Fetch HTTP(S) sécurisé pour l'analyse de sites d'artisans : garde-fous SSRF
// (pas d'IP privées, localhost, métadonnées cloud), timeout, taille max, redirects
// limités. Ne jamais exécuter le JavaScript distant — HTML brut uniquement.
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export const TIMEOUT_FETCH_MS = 8_000;
export const TAILLE_MAX_REPONSE_OCTETS = Math.floor(1.5 * 1024 * 1024); // 1,5 Mo
export const MAX_REDIRECTS = 3;
export const MAX_PAGES_A_FETCH = 6;

const CHEMINS_CANDIDATS = [
  "/",
  "/mentions-legales",
  "/mentions-légales",
  "/legal",
  "/contact",
  "/a-propos",
  "/about",
  "/conditions",
] as const;

const USER_AGENT = "TarineoBot/1.0 (+https://tarineo.fr; analyse profil entreprise)";

export type PageRecuperee = {
  url: string;
  statut: number;
  contentType: string;
  html: string;
};

export type ErreurFetchSite =
  | "url_invalide"
  | "protocole_interdit"
  | "hote_interdit"
  | "inaccessible"
  | "timeout"
  | "trop_volumineux"
  | "erreur_reseau";

export class FetchSiteError extends Error {
  constructor(public readonly code: ErreurFetchSite, message: string) {
    super(message);
    this.name = "FetchSiteError";
  }
}

function estIpPriveeOuReservee(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "::1" || v === "0.0.0.0") return true;
  if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80:")) return true;

  const m = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(v);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast / réservé
  return false;
}

export function normaliserUrlSite(brut: string): URL {
  const trim = brut.trim();
  if (!trim) throw new FetchSiteError("url_invalide", "URL vide.");

  let avecSchema = trim;
  if (!/^https?:\/\//i.test(trim)) {
    avecSchema = `https://${trim}`;
  }

  let url: URL;
  try {
    url = new URL(avecSchema);
  } catch {
    throw new FetchSiteError("url_invalide", "URL invalide.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new FetchSiteError("protocole_interdit", "Seuls HTTP et HTTPS sont autorisés.");
  }
  if (url.username || url.password) {
    throw new FetchSiteError("url_invalide", "Identifiants dans l'URL interdits.");
  }

  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "metadata.google.internal"
  ) {
    throw new FetchSiteError("hote_interdit", "Hôte non autorisé.");
  }

  if (isIP(host) && estIpPriveeOuReservee(host)) {
    throw new FetchSiteError("hote_interdit", "Adresse IP privée interdite.");
  }

  url.hash = "";
  return url;
}

async function verifierResolutionDns(hostname: string): Promise<void> {
  if (isIP(hostname)) {
    if (estIpPriveeOuReservee(hostname)) {
      throw new FetchSiteError("hote_interdit", "Adresse IP privée interdite.");
    }
    return;
  }

  let adresses: string[];
  try {
    const resultats = await lookup(hostname, { all: true, verbatim: true });
    adresses = resultats.map((r) => r.address);
  } catch {
    throw new FetchSiteError("inaccessible", "Impossible de résoudre le nom de domaine.");
  }

  if (adresses.length === 0 || adresses.some(estIpPriveeOuReservee)) {
    throw new FetchSiteError("hote_interdit", "Résolution DNS vers une adresse privée interdite.");
  }
}

async function lireCorpsLimite(reponse: Response): Promise<string> {
  const lecteur = reponse.body?.getReader();
  if (!lecteur) return "";

  const morceaux: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await lecteur.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > TAILLE_MAX_REPONSE_OCTETS) {
      lecteur.cancel().catch(() => undefined);
      throw new FetchSiteError("trop_volumineux", "Réponse trop volumineuse.");
    }
    morceaux.push(value);
  }
  return Buffer.concat(morceaux.map((m) => Buffer.from(m))).toString("utf8");
}

export async function fetchUrlSecurisee(cible: string | URL): Promise<PageRecuperee> {
  let url = typeof cible === "string" ? normaliserUrlSite(cible) : new URL(cible.toString());
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new FetchSiteError("protocole_interdit", "Seuls HTTP et HTTPS sont autorisés.");
  }

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect++) {
    await verifierResolutionDns(url.hostname);

    const controleur = new AbortController();
    const timer = setTimeout(() => controleur.abort(), TIMEOUT_FETCH_MS);

    try {
      const reponse = await fetch(url.toString(), {
        method: "GET",
        redirect: "manual",
        signal: controleur.signal,
        headers: {
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
          "User-Agent": USER_AGENT,
        },
      });

      if ([301, 302, 303, 307, 308].includes(reponse.status)) {
        const location = reponse.headers.get("location");
        if (!location) throw new FetchSiteError("inaccessible", "Redirection sans destination.");
        const suivante = new URL(location, url);
        if (suivante.protocol !== "http:" && suivante.protocol !== "https:") {
          throw new FetchSiteError("protocole_interdit", "Redirection vers un protocole interdit.");
        }
        if (suivante.username || suivante.password) {
          throw new FetchSiteError("url_invalide", "Redirection avec identifiants interdite.");
        }
        url = suivante;
        continue;
      }

      if (!reponse.ok) {
        throw new FetchSiteError("inaccessible", `Site inaccessible (HTTP ${reponse.status}).`);
      }

      const contentType = (reponse.headers.get("content-type") ?? "").toLowerCase();
      if (contentType && !contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
        // Favicon / image : autoriser pour le téléchargement de logo uniquement
        if (!contentType.startsWith("image/")) {
          throw new FetchSiteError("inaccessible", "Type de contenu non supporté.");
        }
      }

      const html = await lireCorpsLimite(reponse);
      return { url: url.toString(), statut: reponse.status, contentType, html };
    } catch (e) {
      if (e instanceof FetchSiteError) throw e;
      if (e instanceof Error && e.name === "AbortError") {
        throw new FetchSiteError("timeout", "Le site met trop de temps à répondre.");
      }
      throw new FetchSiteError("erreur_reseau", "Erreur réseau lors de la connexion au site.");
    } finally {
      clearTimeout(timer);
    }
  }

  throw new FetchSiteError("inaccessible", "Trop de redirections.");
}

export async function fetchBinaireSecurise(cible: string | URL): Promise<{ buffer: Buffer; contentType: string; url: string }> {
  let url = normaliserUrlSite(typeof cible === "string" ? cible : cible.toString());

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect++) {
    await verifierResolutionDns(url.hostname);

    const controleur = new AbortController();
    const timer = setTimeout(() => controleur.abort(), TIMEOUT_FETCH_MS);
    try {
      const reponse = await fetch(url.toString(), {
        method: "GET",
        redirect: "manual",
        signal: controleur.signal,
        headers: { "User-Agent": USER_AGENT, Accept: "image/*,*/*;q=0.1" },
      });

      if ([301, 302, 303, 307, 308].includes(reponse.status)) {
        const location = reponse.headers.get("location");
        if (!location) throw new FetchSiteError("inaccessible", "Redirection sans destination.");
        const suivante = new URL(location, url);
        if (suivante.protocol !== "http:" && suivante.protocol !== "https:") {
          throw new FetchSiteError("protocole_interdit", "Redirection vers un protocole interdit.");
        }
        url = suivante;
        continue;
      }

      if (!reponse.ok) throw new FetchSiteError("inaccessible", "Impossible de télécharger le fichier.");

      const contentType = (reponse.headers.get("content-type") ?? "application/octet-stream").toLowerCase();
      const lecteur = reponse.body?.getReader();
      if (!lecteur) throw new FetchSiteError("inaccessible", "Réponse vide.");

      const morceaux: Uint8Array[] = [];
      let total = 0;
      while (true) {
        const { done, value } = await lecteur.read();
        if (done) break;
        if (!value) continue;
        total += value.byteLength;
        if (total > TAILLE_MAX_REPONSE_OCTETS) {
          lecteur.cancel().catch(() => undefined);
          throw new FetchSiteError("trop_volumineux", "Fichier trop volumineux.");
        }
        morceaux.push(value);
      }

      return {
        buffer: Buffer.concat(morceaux.map((m) => Buffer.from(m))),
        contentType,
        url: url.toString(),
      };
    } catch (e) {
      if (e instanceof FetchSiteError) throw e;
      if (e instanceof Error && e.name === "AbortError") {
        throw new FetchSiteError("timeout", "Téléchargement trop lent.");
      }
      throw new FetchSiteError("erreur_reseau", "Erreur réseau.");
    } finally {
      clearTimeout(timer);
    }
  }

  throw new FetchSiteError("inaccessible", "Trop de redirections.");
}

function extraireLiensRelatifs(html: string, base: URL): string[] {
  const hrefs = new Set<string>();
  const re = /href\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const brut = m[1].trim();
    if (!brut || brut.startsWith("#") || brut.startsWith("mailto:") || brut.startsWith("tel:")) continue;
    try {
      const abs = new URL(brut, base);
      if (abs.hostname === base.hostname) hrefs.add(abs.pathname.replace(/\/$/, "") || "/");
    } catch {
      /* ignore */
    }
  }
  return [...hrefs];
}

function cheminCorrespond(pathname: string, candidat: string): boolean {
  const a = decodeURIComponent(pathname).toLowerCase().replace(/\/$/, "") || "/";
  const b = decodeURIComponent(candidat).toLowerCase().replace(/\/$/, "") || "/";
  return a === b || a.endsWith(b);
}

/**
 * Récupère l'accueil + un sous-ensemble limité de pages utiles (mentions légales,
 * contact, etc.). Pas de crawl agressif : au plus MAX_PAGES_A_FETCH pages.
 */
export async function recupererPagesEntreprise(urlBrute: string): Promise<{
  origine: string;
  pages: PageRecuperee[];
}> {
  const origine = normaliserUrlSite(urlBrute);
  origine.pathname = "/";
  origine.search = "";

  const pages: PageRecuperee[] = [];
  const deja = new Set<string>();

  async function ajouter(chemin: string) {
    if (pages.length >= MAX_PAGES_A_FETCH) return;
    const cible = new URL(origine.toString());
    cible.pathname = chemin === "/" ? "/" : chemin;
    const cle = cible.toString();
    if (deja.has(cle)) return;
    deja.add(cle);
    try {
      const page = await fetchUrlSecurisee(cible);
      pages.push(page);
    } catch {
      /* page absente : on ignore silencieusement */
    }
  }

  await ajouter("/");

  const accueil = pages[0];
  const liensTrouves = accueil ? extraireLiensRelatifs(accueil.html, new URL(accueil.url)) : [];

  for (const candidat of CHEMINS_CANDIDATS) {
    if (candidat === "/") continue;
    const matchFooter = liensTrouves.find((p) => cheminCorrespond(p, candidat));
    await ajouter(matchFooter ?? candidat);
    if (pages.length >= MAX_PAGES_A_FETCH) break;
  }

  // Footer : si des liens "mentions" / "légal" / "contact" n'étaient pas dans la liste fixe
  for (const lien of liensTrouves) {
    if (pages.length >= MAX_PAGES_A_FETCH) break;
    const l = lien.toLowerCase();
    if (
      l.includes("mention") ||
      l.includes("legal") ||
      l.includes("contact") ||
      l.includes("propos") ||
      l.includes("about") ||
      l.includes("condition") ||
      l.includes("cgv") ||
      l.includes("politique")
    ) {
      await ajouter(lien.startsWith("/") ? lien : `/${lien}`);
    }
  }

  if (pages.length === 0) {
    throw new FetchSiteError("inaccessible", "Aucune page accessible.");
  }

  return { origine: origine.origin, pages };
}
