/** Normalise une saisie nom / site / SIRET pour la recherche. */
export type ParsedCompanyQuery = {
  raw: string;
  /** Texte envoyé à l’API. */
  searchText: string;
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
    const tokens = domain
      .replace(/\.(fr|com|net|org|eu|io|co|app|dev)$/i, "")
      .split(/[.\-_]+/)
      .filter((p) => p.length > 1 && !/^(www|app|m)$/i.test(p))
      .join(" ");
    return {
      raw,
      searchText: tokens || domain,
      nameForMatch: normalizeName(tokens || domain),
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

  return {
    raw,
    searchText: [name, city, postalHint].filter(Boolean).join(" "),
    nameForMatch: normalizeName(name),
    cityHint: city,
    postalHint,
    domain: null,
    digits: null,
    website: null,
  };
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
