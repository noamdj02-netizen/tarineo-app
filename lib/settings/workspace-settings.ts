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

export type CompanyWorkspaceSettings = {
  commercial: CommercialSettings;
  documents: DocumentSettings;
  ai: AiSettings;
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

export function emptyWorkspaceSettings(): CompanyWorkspaceSettings {
  return {
    commercial: emptyCommercial(),
    documents: emptyDocumentSettings(),
    ai: emptyAiSettings(),
  };
}

export function parseWorkspaceSettings(raw: unknown): CompanyWorkspaceSettings {
  const base = emptyWorkspaceSettings();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const c = (o.commercial && typeof o.commercial === "object" ? o.commercial : {}) as Record<string, unknown>;
  const d = (o.documents && typeof o.documents === "object" ? o.documents : {}) as Record<string, unknown>;
  const a = (o.ai && typeof o.ai === "object" ? o.ai : {}) as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
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
  };
}
