import "server-only";
import { siretValide } from "@/lib/metier/company";
import { scoreMatch } from "@/lib/company/match-score";
import { parseCompanyQuery } from "@/lib/company/parse-query";
import type { CompanyLookupResponse, CompanyLookupResult } from "@/lib/company/types";
import { resolveWebsiteLogo } from "@/lib/company/website-logo";

const API = "https://recherche-entreprises.api.gouv.fr/search";
const TIMEOUT_MS = 8_000;
const MAX_CANDIDATES = 6;
const AUTO_MIN_SCORE = 72;
const AUTO_GAP = 18;

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
  etat_administratif?: string | null;
};

type ApiEntreprise = {
  siren?: string | null;
  nom_complet?: string | null;
  nom_raison_sociale?: string | null;
  sigle?: string | null;
  activite_principale?: string | null;
  nature_juridique?: string | null;
  etat_administratif?: string | null;
  siege?: ApiSiege | null;
  matching_etablissements?: ApiSiege[] | null;
};

/**
 * Recherche entreprise FR via recherche-entreprises.api.gouv.fr (API publique, sans clé).
 * N’invente jamais de SIRET / adresse. Ambiguïté → candidats.
 */
export async function lookupCompany(query: string): Promise<CompanyLookupResponse> {
  const parsed = parseCompanyQuery(query);
  if (!parsed) {
    return { status: "error", message: "Indiquez un nom d’entreprise ou un SIRET." };
  }

  try {
    const rows = await searchApi(parsed.searchText, parsed.digits);
    if (!rows.length) {
      return { status: "not_found", query: parsed.raw };
    }

    const mapped = dedupeBySiret(
      rows.flatMap((row) => expandEtablissements(row, parsed.website)),
    ).map((c) => ({
      ...c,
      matchScore: scoreMatch(c, parsed.nameForMatch, parsed.cityHint, parsed.postalHint, parsed.digits),
    }));

    mapped.sort((a, b) => b.matchScore - a.matchScore || (a.legalName ?? "").localeCompare(b.legalName ?? "", "fr"));

    // SIRET / SIREN exact → unique résultat fiable
    if (parsed.digits) {
      const exact = mapped.find(
        (r) => r.siret === parsed.digits || r.siren === parsed.digits,
      );
      if (exact?.siret && exact.siretValid) {
        return { status: "found", company: await withLogo(exact, parsed.domain, parsed.website) };
      }
      if (exact && !exact.siretValid) {
        return {
          status: "error",
          message: "SIRET invalide. Vérifiez les informations de l’entreprise.",
        };
      }
      if (mapped.length === 1 && mapped[0].siretValid) {
        return { status: "found", company: await withLogo(mapped[0], parsed.domain, parsed.website) };
      }
      return {
        status: "candidates",
        query: parsed.raw,
        candidates: mapped.slice(0, MAX_CANDIDATES),
      };
    }

    const top = mapped[0];
    const second = mapped[1];
    const confidentAlone =
      top &&
      top.matchScore >= AUTO_MIN_SCORE &&
      top.siretValid &&
      (!second || top.matchScore - second.matchScore >= AUTO_GAP);

    if (confidentAlone) {
      return { status: "found", company: await withLogo(top, parsed.domain, parsed.website) };
    }

    if (!mapped.length) {
      return { status: "not_found", query: parsed.raw };
    }

    return {
      status: "candidates",
      query: parsed.raw,
      candidates: mapped.slice(0, MAX_CANDIDATES),
    };
  } catch (err) {
    console.error("[company-lookup]", err);
    return {
      status: "error",
      message: "Le service de recherche est temporairement indisponible. Vous pouvez continuer manuellement.",
    };
  }
}

async function searchApi(searchText: string, digits: string | null): Promise<ApiEntreprise[]> {
  const q = digits ?? searchText;
  const url = `${API}?q=${encodeURIComponent(q)}&per_page=${digits ? 5 : 10}&page=1`;
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
      const matchEtabs = row.matching_etablissements ?? [];
      return (
        siren === digits ||
        siret === digits ||
        siret.startsWith(digits) ||
        matchEtabs.some((e) => e.siret === digits)
      );
    });
  } finally {
    clearTimeout(timer);
  }
}

function expandEtablissements(row: ApiEntreprise, website: string | null): CompanyLookupResult[] {
  const base = mapEntreprise(row, row.siege ?? null, website);
  const extras = (row.matching_etablissements ?? [])
    .filter((e) => e?.siret && e.siret !== row.siege?.siret)
    .slice(0, 3)
    .map((e) => mapEntreprise(row, e, website));
  return [base, ...extras];
}

function mapEntreprise(
  row: ApiEntreprise,
  siege: ApiSiege | null,
  website: string | null,
): CompanyLookupResult {
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
  const legalForm = formeFromNature(row.nature_juridique, legalName);
  const etat = siege?.etat_administratif ?? row.etat_administratif ?? null;
  const active = etat == null ? null : etat.toUpperCase() === "A";

  return {
    name: legalName,
    legalName,
    tradeName: trade && trade !== legalName ? trade : null,
    legalForm,
    siren,
    siret,
    address,
    postalCode,
    city,
    activity,
    activityLabel: activityLabel(activity),
    active,
    website,
    logoUrl: null,
    siretValid: Boolean(siret && siretValide(siret)),
    matchScore: 0,
    source: "recherche-entreprises",
  };
}

/** Score interne 0–100 (non présenté comme probabilité IA). */
export { scoreMatch } from "@/lib/company/match-score";

async function withLogo(
  company: CompanyLookupResult,
  domain: string | null,
  website: string | null,
): Promise<CompanyLookupResult> {
  // Logo uniquement si un site a été fourni / détecté — jamais inventé depuis le nom.
  if (!website && !domain) return company;
  const logoUrl = await resolveWebsiteLogo(website ?? company.website, domain);
  return { ...company, website: website ?? company.website, logoUrl };
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
    const stripped = full
      .replace(new RegExp(`\\s*${escapeReg(cp)}\\s+${escapeReg(city)}\\s*$`, "i"), "")
      .trim();
    if (stripped) return stripped;
  }
  return full;
}

function formeFromNature(code: string | null | undefined, legalName?: string | null) {
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
  if (!code) return null;
  // INSEE code souvent 5499 (SARL) alors que la raison sociale porte « EURL ».
  if (code === "5499" && legalName && /^\s*EURL\b/i.test(legalName)) return "EURL";
  return map[code] ?? null;
}

/** Libellés APE fréquents BTP — sinon on garde le code. */
function activityLabel(code: string | null) {
  if (!code) return null;
  const map: Record<string, string> = {
    "43.22A": "Travaux d’installation d’eau et de gaz",
    "43.21A": "Travaux d’installation électrique",
    "43.29A": "Autres travaux d’installation",
    "43.31Z": "Travaux de plâtrerie",
    "43.32A": "Travaux de menuiserie bois",
    "43.33Z": "Travaux de revêtement des sols et des murs",
    "43.34Z": "Travaux de peinture et vitrerie",
    "43.39Z": "Autres travaux de finition",
    "43.91A": "Travaux de couverture",
    "41.20A": "Construction de maisons individuelles",
    "42.11Z": "Construction de routes et autoroutes",
    "43.12A": "Travaux de terrassement courants",
  };
  return map[code] ?? null;
}

function dedupeBySiret(rows: CompanyLookupResult[]) {
  const seen = new Set<string>();
  const out: CompanyLookupResult[] = [];
  for (const r of rows) {
    const key = r.siret ?? `${r.siren}-${r.city}-${r.address}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
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

function escapeReg(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
