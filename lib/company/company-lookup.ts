import "server-only";
import { siretValide } from "@/lib/metier/company";
import { parseCompanyQuery } from "@/lib/company/parse-query";
import type { CompanyLookupResponse, CompanyLookupResult } from "@/lib/company/types";
import { resolveWebsiteLogo } from "@/lib/company/website-logo";

const API = "https://recherche-entreprises.api.gouv.fr/search";
const TIMEOUT_MS = 8_000;
const MAX_CANDIDATES = 5;

type ApiSiege = {
  siret?: string | null;
  adresse?: string | null;
  code_postal?: string | null;
  libelle_commune?: string | null;
  complement_adresse?: string | null;
  numero_voie?: string | null;
  type_voie?: string | null;
  libelle_voie?: string | null;
  liste_enseignes?: string[] | null;
  nom_commercial?: string | null;
  activite_principale?: string | null;
};

type ApiEntreprise = {
  siren?: string | null;
  nom_complet?: string | null;
  nom_raison_sociale?: string | null;
  sigle?: string | null;
  activite_principale?: string | null;
  nature_juridique?: string | null;
  siege?: ApiSiege | null;
  matching_etablissements?: ApiSiege[] | null;
};

/**
 * Recherche une entreprise française via l’API officielle
 * recherche-entreprises.api.gouv.fr (pas de clé privée).
 * N’invente jamais de données ; en cas d’ambiguïté, renvoie des candidats.
 */
export async function lookupCompany(query: string): Promise<CompanyLookupResponse> {
  const parsed = parseCompanyQuery(query);
  if (!parsed) {
    return { status: "error", message: "Indiquez un nom d’entreprise ou un site web." };
  }

  try {
    const results = await searchApi(parsed.searchText, parsed.digits);
    if (!results.length) {
      return { status: "not_found", query: parsed.raw };
    }

    const website = parsed.website;
    const mapped = results.map((row) => mapEntreprise(row, website));

    const exact = pickExact(mapped, parsed.searchText, parsed.digits);
    if (exact) {
      return { status: "found", company: await withLogo(exact, parsed.domain, website) };
    }

    if (mapped.length === 1 && isConfidentSingle(mapped[0], parsed.searchText)) {
      return { status: "found", company: await withLogo(mapped[0], parsed.domain, website) };
    }

    // Ambiguïté : on ne choisit pas un SIRET à la place de l’utilisateur.
    return {
      status: "candidates",
      query: parsed.raw,
      candidates: mapped.slice(0, MAX_CANDIDATES),
    };
  } catch (err) {
    console.error("[company-lookup]", err);
    return {
      status: "error",
      message: "La recherche d’entreprise est temporairement indisponible. Saisissez les infos manuellement.",
    };
  }
}

async function searchApi(searchText: string, digits: string | null): Promise<ApiEntreprise[]> {
  const q = digits ?? searchText;
  const url = `${API}?q=${encodeURIComponent(q)}&per_page=${digits ? 5 : 8}&page=1`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = (await res.json()) as { results?: ApiEntreprise[] };
    const rows = json.results ?? [];
    if (!digits) return rows;
    return rows.filter((row) => {
      const siren = row.siren ?? "";
      const siret = row.siege?.siret ?? "";
      return siren === digits || siret === digits || siret.startsWith(digits);
    });
  } finally {
    clearTimeout(timer);
  }

function mapEntreprise(row: ApiEntreprise, website: string | null): CompanyLookupResult {
  const siege = row.siege ?? row.matching_etablissements?.[0] ?? null;
  const siret = digitsOnly(siege?.siret);
  const siren = digitsOnly(row.siren) ?? (siret ? siret.slice(0, 9) : null);
  const legalName = clean(row.nom_raison_sociale) ?? clean(row.nom_complet);
  const trade =
    clean(siege?.nom_commercial) ??
    clean(siege?.liste_enseignes?.[0] ?? null) ??
    clean(row.sigle);
  const address = streetFromSiege(siege);
  const postalCode = clean(siege?.code_postal);
  const city = clean(siege?.libelle_commune)?.toUpperCase() ?? null;
  const activity = clean(siege?.activite_principale) ?? clean(row.activite_principale);
  const forme = formeFromNature(row.nature_juridique);
  const name = legalName ?? (forme ? `${forme}` : null);

  return {
    name,
    legalName,
    tradeName: trade && trade !== legalName ? trade : null,
    siren,
    siret,
    address,
    postalCode,
    city,
    activity,
    website,
    logoUrl: null,
    siretValid: Boolean(siret && siretValide(siret)),
    source: "recherche-entreprises",
  };
}

function streetFromSiege(siege: ApiSiege | null): string | null {
  if (!siege) return null;
  const composed = [
    clean(siege.complement_adresse),
    [siege.numero_voie, siege.type_voie, siege.libelle_voie].filter(Boolean).join(" ").trim() || null,
  ]
    .filter(Boolean)
    .join(", ");
  if (composed) return composed;

  const full = clean(siege.adresse);
  if (!full) return null;
  const cp = clean(siege.code_postal);
  const city = clean(siege.libelle_commune);
  if (cp && city) {
    const stripped = full.replace(new RegExp(`\\s*${escapeReg(cp)}\\s+${escapeReg(city)}\\s*$`, "i"), "").trim();
    if (stripped) return stripped;
  }
  return full;
}

function pickExact(
  rows: CompanyLookupResult[],
  searchText: string,
  digits: string | null,
): CompanyLookupResult | null {
  if (digits) {
    const hit = rows.find((r) => r.siret === digits || r.siren === digits);
    return hit ?? (rows.length === 1 ? rows[0] : null);
  }
  const needle = normalize(searchText);
  if (needle.length < 4) return null;
  const exacts = rows.filter((r) => {
    const names = [r.legalName, r.name, r.tradeName].filter(Boolean).map((n) => normalize(n!));
    return names.some((n) => n === needle || n.includes(needle) || needle.includes(n));
  });
  // Un seul match « fort » (égalité) → trouvé.
  const equal = exacts.filter((r) => {
    const names = [r.legalName, r.name].filter(Boolean).map((n) => normalize(n!));
    return names.includes(needle);
  });
  if (equal.length === 1) return equal[0];
  return null;
}

function isConfidentSingle(row: CompanyLookupResult, searchText: string) {
  const needle = normalize(searchText);
  if (needle.length < 8) return false;
  const names = [row.legalName, row.name, row.tradeName].filter(Boolean).map((n) => normalize(n!));
  return names.some((n) => n.includes(needle) || needle.includes(n));
}

async function withLogo(
  company: CompanyLookupResult,
  domain: string | null,
  website: string | null,
): Promise<CompanyLookupResult> {
  const logoUrl = await resolveWebsiteLogo(website ?? company.website, domain);
  return { ...company, website: website ?? company.website, logoUrl };
}

function formeFromNature(code: string | null | undefined) {
  const map: Record<string, string> = {
    "1000": "Entrepreneur individuel",
    "5498": "EURL",
    "5499": "SARL",
    "5710": "SAS",
    "5720": "SASU",
    "6540": "SCI",
    "5202": "SNC",
    "9220": "Association",
  };
  return code ? map[code] ?? null : null;
}

function digitsOnly(value: string | null | undefined) {
  if (!value) return null;
  const d = value.replace(/\D/g, "");
  return d || null;
}

function clean(value: string | null | undefined) {
  const t = value?.trim();
  return t ? t : null;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function escapeReg(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
