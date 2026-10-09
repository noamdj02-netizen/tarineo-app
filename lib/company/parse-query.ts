/** Normalise une saisie nom / site / SIRET pour la recherche. */
export type ParsedCompanyQuery = {
  raw: string;
  /** Texte envoyé à l’API (premier essai). */
  searchText: string;
  /**
   * Variantes supplémentaires à essayer si le 1er essai est vide
   * (ex. INKFLOW → « ink flow », domaine → tokens).
   */
  searchVariants: string[];
  /** Nom normalisé pour le matching (sans forme juridique ni ville). */
  nameForMatch: string;
  /** Ville éventuelle détectée dans la requête. */
  cityHint: string | null;
  /** Code postal éventuel (5 chiffres). */
  postalHint: string | null;
  /** Domaine détecté (sans www), sinon null. */
  domain: string | null;
  /** SIREN (9) ou SIRET (14) détecté. */
  digits: string | null;
  website: string | null;
};

const LEGAL_FORMS = [
  "entrepreneur individuel",
  "micro entreprise",
  "micro-entreprise",
  "auto entrepreneur",
  "auto-entrepreneur",
  "eurl",
  "sarl",
  "sasu",
  "sas",
  "sa",
  "sci",
  "snc",
  "scp",
  "selarl",
  "selas",
  "ei",
];

export function parseCompanyQuery(input: string): ParsedCompanyQuery | null {
  const raw = input.trim();
  if (!raw || raw.length < 2) return null;

  // SIRET / SIREN même avec espaces
  const digitsOnly = raw.replace(/\D/g, "");
  if ((digitsOnly.length === 9 || digitsOnly.length === 14) && /^[\d\s]+$/.test(raw.replace(/[.\-]/g, ""))) {
    return {
      raw,
      searchText: digitsOnly,
      searchVariants: [],
      nameForMatch: "",
      cityHint: null,
      postalHint: null,
      domain: null,
      digits: digitsOnly,
      website: null,
    };
  }

  // SIRET collé dans une phrase : "mon siret 53371252700019"
  const embedded = raw.match(/\b(\d{3}\s?\d{3}\s?\d{3}\s?\d{5})\b/) ?? raw.match(/\b(\d{14})\b/);
  if (embedded) {
    const d = embedded[1].replace(/\D/g, "");
    if (d.length === 14) {
      return {
        raw,
        searchText: d,
        searchVariants: [],
        nameForMatch: "",
        cityHint: null,
        postalHint: null,
        domain: null,
        digits: d,
        website: null,
      };
    }
  }

  const domain = extractDomain(raw);
  if (domain) {
    const label = domain.replace(/\.(fr|com|net|org|eu|io|co|app|dev|me|studio|agency)$/i, "");
    const tokens = label
      .split(/[.\-_]+/)
      .flatMap((p) => splitGluedBrand(p))
      .filter((p) => p.length > 1 && !/^(www|app|m)$/i.test(p))
      .join(" ");
    const spaced = tokens || label.replace(/[-_]+/g, " ");
    return {
      raw,
      searchText: spaced || domain,
      searchVariants: uniqueVariants([spaced, label.replace(/[-_]+/g, " "), label]),
      nameForMatch: normalizeName(spaced || domain),
      cityHint: null,
      postalHint: null,
      domain,
      digits: null,
      website: `https://${domain}`,
    };
  }

  const postalHint = raw.match(/\b(\d{5})\b/)?.[1] ?? null;
  const withoutPostal = postalHint ? raw.replace(postalHint, " ") : raw;
  const { name, city } = splitNameAndCity(withoutPostal);
  const primary = [name, city, postalHint].filter(Boolean).join(" ");
  const brandVariants = expandBrandQuery(name);

  return {
    raw,
    searchText: primary,
    searchVariants: uniqueVariants(brandVariants.filter((v) => v.toLowerCase() !== primary.toLowerCase())),
    nameForMatch: normalizeName(name),
    cityHint: city,
    postalHint,
    domain: null,
    digits: null,
    website: null,
  };
}

/** INKFLOW → ink flow ; InkFlow → Ink Flow. Ne découpe pas les noms ordinaires (Dupont…). */
export function splitGluedBrand(token: string): string[] {
  const t = token.trim();
  if (!t || t.includes(" ")) return t ? [t] : [];
  // CamelCase / PascalCase
  const camel = t
    .replace(/([a-zà-ÿ])([A-ZÀ-Ÿ])/g, "$1 $2")
    .replace(/([A-ZÀ-Ÿ]+)([A-ZÀ-Ÿ][a-zà-ÿ])/g, "$1 $2");
  if (camel !== t && camel.includes(" ")) return camel.split(/\s+/).filter(Boolean);
  // Marque tout en majuscules collée (INKFLOW, TARINEO…)
  if (/^[A-ZÀ-Ÿ]{6,18}$/.test(t)) {
    const lower = t.toLowerCase();
    for (const cut of [3, 4, 5, Math.floor(lower.length / 2)]) {
      if (cut >= 3 && lower.length - cut >= 3) {
        return [lower.slice(0, cut), lower.slice(cut)];
      }
    }
  }
  // Minuscules collées : suffixe marque courant
  if (/^[a-zà-ÿ]{6,18}$/.test(t)) {
    for (const suf of ["flow", "soft", "lab", "tech", "group", "bat", "btp", "pro"]) {
      if (t.endsWith(suf) && t.length - suf.length >= 3) {
        return [t.slice(0, -suf.length), suf];
      }
    }
  }
  return [t];
}

function expandBrandQuery(name: string): string[] {
  const parts = name.trim().split(/\s+/);
  const out: string[] = [];
  if (parts.length === 1) {
    const splits = splitGluedBrand(parts[0]);
    if (splits.length > 1) out.push(splits.join(" "));
  }
  if (name.includes("-")) out.push(name.replace(/-/g, " "));
  return out;
}

function uniqueVariants(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const t = v.trim();
    if (!t || t.length < 2) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

/** Strip forme juridique + accents pour comparer deux noms. */
export function normalizeName(value: string) {
  let n = value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  for (const form of LEGAL_FORMS) {
    n = n.replace(new RegExp(`\\b${form.replace(/[-\s]/g, "[-\\s]?")}\\b`, "gi"), " ");
  }
  return n.replace(/\s+/g, " ").trim();
}

function splitNameAndCity(raw: string): { name: string; city: string | null } {
  const parts = raw.trim().split(/\s+/);
  if (parts.length < 2) return { name: raw.trim(), city: null };
  // Heuristique légère : dernier token alphabétique long = ville possible
  // (évite de couper « Dupont Plomberie »).
  const last = parts[parts.length - 1];
  const looksCity =
    last.length >= 4 &&
    /^[A-Za-zÀ-ÿ'’-]+$/.test(last) &&
    !/^(sarl|sas|eurl|sa|sci|btp|plomberie|electricite|électricité|peinture|macon|maçon|renovation|rénovation)$/i.test(
      last,
    );
  if (!looksCity) return { name: raw.trim(), city: null };
  // Ne détache la ville que si le reste contient déjà un vrai nom (≥ 2 tokens).
  if (parts.length < 3) return { name: raw.trim(), city: null };
  return {
    name: parts.slice(0, -1).join(" "),
    city: last,
  };
}

function extractDomain(value: string): string | null {
  const trimmed = value.trim();
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProto);
    if (!url.hostname.includes(".")) return null;
    if (!/\.[a-z]{2,}$/i.test(url.hostname)) return null;
    // Évite de traiter « Dupont.SA » comme domaine (TLD inventé rare OK, mais pas 2 lettres métier)
    if (/^(sa|ei)$/i.test(url.hostname.split(".").pop() ?? "")) return null;
    return url.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}
