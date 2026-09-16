// Extraction d'un profil entreprise à partir du HTML public d'un site d'artisan.
// L'IA ne voit que du texte déjà récupéré côté serveur (jamais d'URL à crawler elle-même,
// jamais de secrets). Toute valeur sensible (SIRET, IBAN, TVA…) est re-validée en code
// après coup : une valeur invalide devient null, jamais inventée.
import { z } from "zod";
import { anthropic } from "@/lib/anthropic";
import {
  normaliserCouleurHex,
  normaliserEmail,
  normaliserIban,
  normaliserNumeroTva,
  normaliserSiren,
  normaliserSiret,
  normaliserTelephoneFr,
} from "@/lib/entreprise";
import type { PageRecuperee } from "@/lib/fetchSiteSecurise";

const MODELE = "claude-sonnet-5";

export type NiveauConfiance = "HIGH" | "MEDIUM" | "LOW";

export type ChampExtrait<T> = {
  value: T | null;
  confidence: NiveauConfiance;
  sourceUrl: string | null;
};

export type ExtractedCompanyProfile = {
  legalName: ChampExtrait<string>;
  commercialName: ChampExtrait<string>;
  siret: ChampExtrait<string>;
  siren: ChampExtrait<string>;
  vatNumber: ChampExtrait<string>;
  legalForm: ChampExtrait<string>;
  address: ChampExtrait<string>;
  postalCode: ChampExtrait<string>;
  city: ChampExtrait<string>;
  phone: ChampExtrait<string>;
  email: ChampExtrait<string>;
  website: ChampExtrait<string>;
  iban: ChampExtrait<string>;
  capitalSocial: ChampExtrait<string>;
  registreImmatriculation: ChampExtrait<string>;
  mentionsLegales: ChampExtrait<string>;
  conditionsPaiement: ChampExtrait<string>;
  logoUrl: ChampExtrait<string>;
  primaryColor: ChampExtrait<string>;
  secondaryColor: ChampExtrait<string>;
  activity: ChampExtrait<string>;
  activityDescription: ChampExtrait<string>;
  confidence: number;
  sources: Array<{ field: string; url: string }>;
};

const champIaSchema = z.object({
  value: z.string().nullable(),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
  source_url: z.string().nullable(),
});

const extractionIaSchema = z.object({
  legal_name: champIaSchema,
  commercial_name: champIaSchema,
  siret: champIaSchema,
  siren: champIaSchema,
  vat_number: champIaSchema,
  legal_form: champIaSchema,
  address: champIaSchema,
  postal_code: champIaSchema,
  city: champIaSchema,
  phone: champIaSchema,
  email: champIaSchema,
  website: champIaSchema,
  iban: champIaSchema,
  capital_social: champIaSchema,
  registre_immatriculation: champIaSchema,
  mentions_legales: champIaSchema,
  conditions_paiement: champIaSchema,
  logo_url: champIaSchema,
  primary_color: champIaSchema,
  secondary_color: champIaSchema,
  activity: champIaSchema,
  activity_description: champIaSchema,
  confidence: z.number(),
});

const CHAMP_JSON = {
  type: "object",
  properties: {
    value: { type: ["string", "null"] },
    confidence: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
    source_url: { type: ["string", "null"] },
  },
  required: ["value", "confidence", "source_url"],
  additionalProperties: false,
} as const;

const JSON_SCHEMA = {
  type: "object",
  properties: {
    legal_name: CHAMP_JSON,
    commercial_name: CHAMP_JSON,
    siret: CHAMP_JSON,
    siren: CHAMP_JSON,
    vat_number: CHAMP_JSON,
    legal_form: CHAMP_JSON,
    address: CHAMP_JSON,
    postal_code: CHAMP_JSON,
    city: CHAMP_JSON,
    phone: CHAMP_JSON,
    email: CHAMP_JSON,
    website: CHAMP_JSON,
    iban: CHAMP_JSON,
    capital_social: CHAMP_JSON,
    registre_immatriculation: CHAMP_JSON,
    mentions_legales: CHAMP_JSON,
    conditions_paiement: CHAMP_JSON,
    logo_url: CHAMP_JSON,
    primary_color: CHAMP_JSON,
    secondary_color: CHAMP_JSON,
    activity: CHAMP_JSON,
    activity_description: CHAMP_JSON,
    confidence: { type: "number" },
  },
  required: [
    "legal_name",
    "commercial_name",
    "siret",
    "siren",
    "vat_number",
    "legal_form",
    "address",
    "postal_code",
    "city",
    "phone",
    "email",
    "website",
    "iban",
    "capital_social",
    "registre_immatriculation",
    "mentions_legales",
    "conditions_paiement",
    "logo_url",
    "primary_color",
    "secondary_color",
    "activity",
    "activity_description",
    "confidence",
  ],
  additionalProperties: false,
} as const;

const PROMPT = `Tu analyses le contenu PUBLIC d'un site web d'artisan du bâtiment français
(plombier, chauffagiste, électricien, multi-corps d'état…) pour préremplir une fiche
entreprise destinée à des devis et factures.

RÈGLE ABSOLUE : n'invente JAMAIS une information. Si une donnée n'est pas explicitement
présente dans les textes fournis, renvoie value: null. Cela concerne surtout :
SIRET, SIREN, IBAN, TVA, adresse, téléphone, email, raison sociale, capital social.

Pour chaque champ, renvoie :
- value : la valeur trouvée, ou null
- confidence : HIGH si trouvé sur mentions légales / JSON-LD / page contact claire ;
  MEDIUM si footer ou page d'accueil ; LOW si déduit vaguement du contenu marketing
- source_url : l'URL de la page fournie où tu as trouvé l'info, ou null

Champs :
- legal_name : raison sociale
- commercial_name : nom commercial / enseigne
- siret : 14 chiffres (espaces acceptés en entrée, tu peux les laisser)
- siren : 9 chiffres si présent (sinon dérivable du SIRET — uniquement si SIRET trouvé)
- vat_number : TVA intracommunautaire (FR…)
- legal_form : EI, EURL, SASU, SARL…
- address, postal_code, city
- phone, email, website
- iban : UNIQUEMENT s'il est écrit noir sur blanc. Ne jamais inventer ni compléter.
- capital_social, registre_immatriculation (RCS/RM)
- mentions_legales : court extrait pertinent si trouvé
- conditions_paiement : si mentionnées
- logo_url : URL absolue d'un logo si identifiable dans les indices fournis
- primary_color / secondary_color : hex #RRGGBB si détectable
- activity / activity_description : métier et description courte

confidence global (0–1) : fiabilité d'ensemble de l'extraction.`;

const TAILLE_MAX_TEXTE_PAR_PAGE = 12_000;
const TAILLE_MAX_TOTAL = 40_000;

function htmlVersTexte(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extraireJsonLd(html: string): string[] {
  const blocs: string[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const brut = m[1].trim();
    if (brut.length > 0 && brut.length < 8000) blocs.push(brut);
  }
  return blocs;
}

function extraireMeta(html: string, propriete: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${propriete}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const m = re.exec(html);
  if (m) return m[1];
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${propriete}["']`,
    "i"
  );
  const m2 = re2.exec(html);
  return m2?.[1] ?? null;
}

function extraireLiensIcone(html: string, baseUrl: string): string[] {
  const urls: string[] = [];
  const re = /<link[^>]+rel=["']([^"']*)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    const rel = m[1].toLowerCase();
    if (!rel.includes("icon") && !rel.includes("apple-touch")) continue;
    const href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href) continue;
    try {
      urls.push(new URL(href, baseUrl).toString());
    } catch {
      /* ignore */
    }
  }
  return urls;
}

function extraireLogosImg(html: string, baseUrl: string): string[] {
  const urls: string[] = [];
  const re = /<img[^>]+>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    const src = /src=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!src) continue;
    const indice = `${tag}`.toLowerCase();
    if (!/logo|brand|header/.test(indice) && !/logo/.test(src.toLowerCase())) continue;
    try {
      urls.push(new URL(src, baseUrl).toString());
    } catch {
      /* ignore */
    }
  }
  return urls;
}

function extraireCouleursCss(html: string): string[] {
  const couleurs = new Set<string>();
  const re = /#([0-9a-fA-F]{6})\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const hex = `#${m[1].toLowerCase()}`;
    if (["#000000", "#ffffff", "#111111", "#222222", "#333333", "#eeeeee", "#f5f5f5", "#fafafa"].includes(hex)) {
      continue;
    }
    couleurs.add(hex);
    if (couleurs.size >= 8) break;
  }
  return [...couleurs];
}

export type IndicesSite = {
  pagesTexte: Array<{ url: string; texte: string; jsonLd: string[] }>;
  logoCandidats: string[];
  couleursCandidats: string[];
  ogImage: string | null;
  website: string;
};

export function preparerIndicesSite(origine: string, pages: PageRecuperee[]): IndicesSite {
  const logoCandidats: string[] = [];
  const couleursCandidats: string[] = [];
  let ogImage: string | null = null;
  const pagesTexte: IndicesSite["pagesTexte"] = [];
  let budget = TAILLE_MAX_TOTAL;

  for (const page of pages) {
    const jsonLd = extraireJsonLd(page.html);
    const texte = htmlVersTexte(page.html).slice(0, TAILLE_MAX_TEXTE_PAR_PAGE);
    const tronque = texte.slice(0, Math.max(0, budget));
    budget -= tronque.length;
    pagesTexte.push({ url: page.url, texte: tronque, jsonLd });

    if (!ogImage) {
      const og = extraireMeta(page.html, "og:image");
      if (og) {
        try {
          ogImage = new URL(og, page.url).toString();
        } catch {
          /* ignore */
        }
      }
    }

    for (const u of extraireLogosImg(page.html, page.url)) {
      if (!logoCandidats.includes(u)) logoCandidats.push(u);
    }
    for (const u of extraireLiensIcone(page.html, page.url)) {
      if (!logoCandidats.includes(u)) logoCandidats.push(u);
    }
    for (const c of extraireCouleursCss(page.html)) {
      if (!couleursCandidats.includes(c)) couleursCandidats.push(c);
    }
  }

  if (ogImage && !logoCandidats.includes(ogImage)) {
    logoCandidats.push(ogImage);
  }

  return {
    pagesTexte,
    logoCandidats: logoCandidats.slice(0, 8),
    couleursCandidats: couleursCandidats.slice(0, 6),
    ogImage,
    website: origine,
  };
}

function champVide<T>(): ChampExtrait<T> {
  return { value: null, confidence: "LOW", sourceUrl: null };
}

function mapperChamp(
  brut: z.infer<typeof champIaSchema>,
  normaliser: (v: string | null) => string | null
): ChampExtrait<string> {
  const value = normaliser(brut.value);
  if (!value) return { value: null, confidence: brut.confidence, sourceUrl: brut.source_url };
  return { value, confidence: brut.confidence, sourceUrl: brut.source_url };
}

function identite(brut: z.infer<typeof champIaSchema>): ChampExtrait<string> {
  const value = brut.value?.trim() ? brut.value.trim() : null;
  return { value, confidence: brut.confidence, sourceUrl: brut.source_url };
}

function collecterSources(profil: ExtractedCompanyProfile): Array<{ field: string; url: string }> {
  const sources: Array<{ field: string; url: string }> = [];
  const entrees: Array<[string, ChampExtrait<string>]> = [
    ["legalName", profil.legalName],
    ["commercialName", profil.commercialName],
    ["siret", profil.siret],
    ["siren", profil.siren],
    ["vatNumber", profil.vatNumber],
    ["legalForm", profil.legalForm],
    ["address", profil.address],
    ["postalCode", profil.postalCode],
    ["city", profil.city],
    ["phone", profil.phone],
    ["email", profil.email],
    ["iban", profil.iban],
    ["logoUrl", profil.logoUrl],
    ["activity", profil.activity],
  ];
  for (const [field, champ] of entrees) {
    if (champ.value && champ.sourceUrl) sources.push({ field, url: champ.sourceUrl });
  }
  return sources;
}

export function validerProfilExtrait(brut: z.infer<typeof extractionIaSchema>, indices: IndicesSite): ExtractedCompanyProfile {
  const siret = mapperChamp(brut.siret, normaliserSiret);
  let siren = mapperChamp(brut.siren, normaliserSiren);
  if (!siren.value && siret.value) {
    siren = { value: siret.value.slice(0, 9), confidence: siret.confidence, sourceUrl: siret.sourceUrl };
  }

  let logo = identite(brut.logo_url);
  if (logo.value) {
    try {
      logo = { ...logo, value: new URL(logo.value, indices.website).toString() };
    } catch {
      logo = { value: null, confidence: "LOW", sourceUrl: null };
    }
  }
  if (!logo.value && indices.logoCandidats[0]) {
    logo = { value: indices.logoCandidats[0], confidence: "MEDIUM", sourceUrl: indices.pagesTexte[0]?.url ?? null };
  }

  let primary = mapperChamp(brut.primary_color, normaliserCouleurHex);
  let secondary = mapperChamp(brut.secondary_color, normaliserCouleurHex);
  if (!primary.value && indices.couleursCandidats[0]) {
    primary = { value: indices.couleursCandidats[0], confidence: "LOW", sourceUrl: indices.pagesTexte[0]?.url ?? null };
  }
  if (!secondary.value && indices.couleursCandidats[1]) {
    secondary = { value: indices.couleursCandidats[1], confidence: "LOW", sourceUrl: indices.pagesTexte[0]?.url ?? null };
  }

  const profil: ExtractedCompanyProfile = {
    legalName: identite(brut.legal_name),
    commercialName: identite(brut.commercial_name),
    siret,
    siren,
    vatNumber: mapperChamp(brut.vat_number, normaliserNumeroTva),
    legalForm: identite(brut.legal_form),
    address: identite(brut.address),
    postalCode: identite(brut.postal_code),
    city: identite(brut.city),
    phone: mapperChamp(brut.phone, normaliserTelephoneFr),
    email: mapperChamp(brut.email, normaliserEmail),
    website: {
      value: indices.website,
      confidence: "HIGH",
      sourceUrl: indices.website,
    },
    iban: mapperChamp(brut.iban, normaliserIban),
    capitalSocial: identite(brut.capital_social),
    registreImmatriculation: identite(brut.registre_immatriculation),
    mentionsLegales: identite(brut.mentions_legales),
    conditionsPaiement: identite(brut.conditions_paiement),
    logoUrl: logo,
    primaryColor: primary,
    secondaryColor: secondary,
    activity: identite(brut.activity),
    activityDescription: identite(brut.activity_description),
    confidence: Math.min(1, Math.max(0, brut.confidence)),
    sources: [],
  };
  profil.sources = collecterSources(profil);
  return profil;
}

export function profilVide(website: string): ExtractedCompanyProfile {
  return {
    legalName: champVide(),
    commercialName: champVide(),
    siret: champVide(),
    siren: champVide(),
    vatNumber: champVide(),
    legalForm: champVide(),
    address: champVide(),
    postalCode: champVide(),
    city: champVide(),
    phone: champVide(),
    email: champVide(),
    website: { value: website, confidence: "HIGH", sourceUrl: website },
    iban: champVide(),
    capitalSocial: champVide(),
    registreImmatriculation: champVide(),
    mentionsLegales: champVide(),
    conditionsPaiement: champVide(),
    logoUrl: champVide(),
    primaryColor: champVide(),
    secondaryColor: champVide(),
    activity: champVide(),
    activityDescription: champVide(),
    confidence: 0,
    sources: [],
  };
}

export async function extraireProfilDepuisIndices(indices: IndicesSite): Promise<ExtractedCompanyProfile> {
  const contexte = indices.pagesTexte
    .map((p) => {
      const ld = p.jsonLd.length ? `\nJSON-LD:\n${p.jsonLd.join("\n")}` : "";
      return `--- PAGE ${p.url} ---\n${p.texte}${ld}`;
    })
    .join("\n\n");

  const indicesLogos = indices.logoCandidats.length
    ? `\nCandidats logo (URLs) :\n${indices.logoCandidats.map((u) => `- ${u}`).join("\n")}`
    : "\nAucun candidat logo détecté automatiquement.";
  const indicesCouleurs = indices.couleursCandidats.length
    ? `\nCouleurs hex détectées dans le CSS/HTML : ${indices.couleursCandidats.join(", ")}`
    : "";

  const userContent = `Site analysé : ${indices.website}
${indicesLogos}
${indicesCouleurs}

Contenu des pages (texte + JSON-LD éventuel) :
${contexte}`;

  const reponse = await anthropic.messages.create({
    model: MODELE,
    max_tokens: 4096,
    output_config: { format: { type: "json_schema", schema: JSON_SCHEMA } },
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: `${PROMPT}\n\n${userContent}` }],
      },
    ],
  });

  if (reponse.stop_reason === "refusal") {
    return profilVide(indices.website);
  }

  const blocTexte = reponse.content.find((bloc) => bloc.type === "text");
  if (!blocTexte || blocTexte.type !== "text") {
    return profilVide(indices.website);
  }

  let json: unknown;
  try {
    json = JSON.parse(blocTexte.text);
  } catch {
    const m = /\{[\s\S]*\}/.exec(blocTexte.text);
    if (!m) return profilVide(indices.website);
    try {
      json = JSON.parse(m[0]);
    } catch {
      return profilVide(indices.website);
    }
  }

  const parsed = extractionIaSchema.safeParse(json);
  if (!parsed.success) return profilVide(indices.website);
  return validerProfilExtrait(parsed.data, indices);
}

/** Nombre de champs "utiles" trouvés (hors website). */
export function compterChampsTrouves(profil: ExtractedCompanyProfile): number {
  const champs = [
    profil.legalName,
    profil.commercialName,
    profil.siret,
    profil.address,
    profil.postalCode,
    profil.city,
    profil.phone,
    profil.email,
    profil.vatNumber,
    profil.iban,
    profil.logoUrl,
    profil.legalForm,
  ];
  return champs.filter((c) => c.value).length;
}
