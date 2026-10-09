/**
 * Paramètres commerciaux entreprise — références pour devis / IA.
 * Jamais inventés : uniquement ce que l’utilisateur a configuré.
 */
export type CommercialSettings = {
  tauxHoraireHt: number | null;
  coefficientMateriaux: number | null;
  margeCiblePct: number | null;
  tvaDefautPct: number | null;
  conditionsPaiement: string;
  acomptePct: number | null;
  validiteDevisJours: number | null;
  /** Objectifs d’achat HT annuels par enseigne (libellé → montant €). */
  distributorGoalsHt: Record<string, number>;
  /** Objectifs d’achat HT mensuels par enseigne (plafond / mois en cours). */
  distributorGoalsMonthlyHt: Record<string, number>;
};

export type DocumentSettings = {
  mentionPiedPage: string;
  conditionsGenerales: string;
  numerotationPrefixe: string;
};

export type AiSettings = {
  analyseDevis: boolean;
  analyseFacture: boolean;
  detectionHausses: boolean;
  copilote: boolean;
};

/** Signature / identité mail (relances, acceptation, renégociation). */
export type EmailSettings = {
  /** Formule de politesse courte, ex. « Cordialement, ». */
  signOff: string;
  /** Bloc signature (nom, titre, tél, site…). */
  signatureText: string;
  /** Nom affiché optionnel. */
  fromName: string;
  /** URL logo détectée dans un mail collé (indicatif). */
  logoFromEmailUrl: string;
};

export type CompanyWorkspaceSettings = {
  commercial: CommercialSettings;
  documents: DocumentSettings;
  ai: AiSettings;
  email: EmailSettings;
};

export function emptyCommercial(): CommercialSettings {
  return {
    tauxHoraireHt: null,
    coefficientMateriaux: null,
    margeCiblePct: null,
    tvaDefautPct: null,
    conditionsPaiement: "",
    acomptePct: null,
    validiteDevisJours: 30,
    distributorGoalsHt: {},
    distributorGoalsMonthlyHt: {},
  };
}

function parseDistributorGoals(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const key = k.trim();
    if (!key) continue;
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n) && n > 0) out[key] = n;
  }
  return out;
}

export function emptyDocumentSettings(): DocumentSettings {
  return {
    mentionPiedPage: "",
    conditionsGenerales: "",
    numerotationPrefixe: "",
  };
}

export function emptyAiSettings(): AiSettings {
  return {
    analyseDevis: true,
    analyseFacture: true,
    detectionHausses: true,
    copilote: true,
  };
}

export function emptyEmailSettings(): EmailSettings {
  return {
    signOff: "",
    signatureText: "",
    fromName: "",
    logoFromEmailUrl: "",
  };
}

export function emptyWorkspaceSettings(): CompanyWorkspaceSettings {
  return {
    commercial: emptyCommercial(),
    documents: emptyDocumentSettings(),
    ai: emptyAiSettings(),
    email: emptyEmailSettings(),
  };
}

export function parseWorkspaceSettings(raw: unknown): CompanyWorkspaceSettings {
  const base = emptyWorkspaceSettings();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const c = (o.commercial && typeof o.commercial === "object" ? o.commercial : {}) as Record<string, unknown>;
  const d = (o.documents && typeof o.documents === "object" ? o.documents : {}) as Record<string, unknown>;
  const a = (o.ai && typeof o.ai === "object" ? o.ai : {}) as Record<string, unknown>;
  const e = (o.email && typeof o.email === "object" ? o.email : {}) as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  return {
    commercial: {
      tauxHoraireHt: num(c.tauxHoraireHt),
      coefficientMateriaux: num(c.coefficientMateriaux),
      margeCiblePct: num(c.margeCiblePct),
      tvaDefautPct: num(c.tvaDefautPct),
      conditionsPaiement: typeof c.conditionsPaiement === "string" ? c.conditionsPaiement : "",
      acomptePct: num(c.acomptePct),
      validiteDevisJours: num(c.validiteDevisJours) ?? 30,
      distributorGoalsHt: parseDistributorGoals(c.distributorGoalsHt),
      distributorGoalsMonthlyHt: parseDistributorGoals(c.distributorGoalsMonthlyHt),
    },
    documents: {
      mentionPiedPage: typeof d.mentionPiedPage === "string" ? d.mentionPiedPage : "",
      conditionsGenerales: typeof d.conditionsGenerales === "string" ? d.conditionsGenerales : "",
      numerotationPrefixe: typeof d.numerotationPrefixe === "string" ? d.numerotationPrefixe : "",
    },
    ai: {
      analyseDevis: typeof a.analyseDevis === "boolean" ? a.analyseDevis : true,
      analyseFacture: typeof a.analyseFacture === "boolean" ? a.analyseFacture : true,
      detectionHausses: typeof a.detectionHausses === "boolean" ? a.detectionHausses : true,
      copilote: typeof a.copilote === "boolean" ? a.copilote : true,
    },
    email: {
      signOff: str(e.signOff, 120),
      signatureText: str(e.signatureText, 2000),
      fromName: str(e.fromName, 120),
      logoFromEmailUrl: str(e.logoFromEmailUrl, 500),
    },
  };
}
