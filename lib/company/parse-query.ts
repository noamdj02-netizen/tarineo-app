/** Normalise une saisie « nom » ou « site web » pour la recherche. */
export type ParsedCompanyQuery = {
  raw: string;
  /** Texte envoyé à l’API (nom ou tokens issus du domaine). */
  searchText: string;
  /** Domaine détecté (sans www), sinon null. */
  domain: string | null;
  /** SIREN (9) ou SIRET (14) détecté. */
  digits: string | null;
  website: string | null;
};

export function parseCompanyQuery(input: string): ParsedCompanyQuery | null {
  const raw = input.trim();
  if (!raw || raw.length < 2) return null;

  const digitsOnly = raw.replace(/\s/g, "");
  if (/^\d{9}$/.test(digitsOnly) || /^\d{14}$/.test(digitsOnly)) {
    return { raw, searchText: digitsOnly, domain: null, digits: digitsOnly, website: null };
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
      domain,
      digits: null,
      website: `https://${domain}`,
    };
  }

  return { raw, searchText: raw, domain: null, digits: null, website: null };
}

function extractDomain(value: string): string | null {
  const trimmed = value.trim();
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProto);
    if (!url.hostname.includes(".")) return null;
    // Exige un TLD plausible pour éviter de traiter un nom comme domaine.
    if (!/\.[a-z]{2,}$/i.test(url.hostname)) return null;
    return url.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}
