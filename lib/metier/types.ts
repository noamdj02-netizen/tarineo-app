export type PartyKind = "client" | "fournisseur" | "distributeur" | "atelier";
export type ChantierStatus = "focus" | "pause" | "fini";
export type DocDirection = "in" | "out";
export type DocKind = "devis" | "facture" | "bon_commande" | "bl" | "bon_enlevement" | "autre";

/** Documents que l’artisan peut créer pour son client à partir d’un fichier importé. */
export const CLIENT_OUT_KINDS = ["devis", "bon_commande", "bon_enlevement", "facture"] as const;
export type ClientOutKind = (typeof CLIENT_OUT_KINDS)[number];
export type DocStatus = "uploading" | "reading" | "ready" | "error";

export type Party = {
  id: string;
  kind: PartyKind;
  name: string;
  address: string;
  seed_key: string | null;
};

export type Product = {
  id: string;
  name: string;
  family: string;
  unit: string;
  seed_key: string | null;
};

export type Chantier = {
  id: string;
  slug: string;
  name: string;
  address: string;
  client_id: string | null;
  project_id: string | null;
  status: ChantierStatus;
  seed_key: string | null;
  created_at: string;
  updated_at: string;
};

export type ChantierCard = Chantier & {
  client_name: string | null;
  docs_count: number;
};

export type DocumentLine = {
  id: string;
  document_id: string;
  product_id: string | null;
  supplier_party_id: string | null;
  distributor_party_id: string | null;
  label: string;
  qty: number;
  unit: string;
  buy_price: number;
  sell_price: number;
  position: number;
};

export type DocumentRow = {
  id: string;
  direction: DocDirection;
  kind: DocKind;
  title: string;
  party_id: string | null;
  chantier_id: string | null;
  source_document_id: string | null;
  file_path: string;
  extract: Record<string, unknown>;
  status: DocStatus;
  error: string;
  seed_key: string | null;
  created_at: string;
};

export type DocumentCard = DocumentRow & {
  party_name: string | null;
  party_address: string | null;
  party_kind: PartyKind | null;
  chantier_name: string | null;
  chantier_slug: string | null;
  lines: DocumentLine[];
};

export type PriceAlert = {
  id: string;
  product_id: string | null;
  document_id: string | null;
  chantier_id: string | null;
  label: string;
  old_price: number;
  new_price: number;
  created_at: string;
  chantier_name?: string | null;
};

export type ExtractTotals = {
  /** Total hors taxe du document. */
  ht: number | null;
  /** Total TVA (si calculé / lu). */
  tva?: number | null;
  /** Total TTC (si calculé / lu). */
  ttc?: number | null;
  /** Éco-contribution (REP, etc.). */
  eco_contribution: number | null;
  /** Éco-contribution filière PMCB (produits et matériaux de construction). */
  pmcb: number | null;
  /** Poids total en kg, seulement s’il est écrit sur le document. */
  weight_kg: number | null;
};

export type ExtractLine = {
  label: string;
  qty: number;
  unit: string;
  buy_price: number;
  sell_price?: number;
  eco_contribution?: number | null;
  pmcb?: number | null;
  weight_kg?: number | null;
};

export type ReadQuality = "fiable" | "partiel" | "incertain";

export type ExtractReadAssessment = {
  summary: string;
  quality: ReadQuality;
  caveats: string[];
};

export type ExtractResult = {
  direction: DocDirection;
  kind: DocKind;
  title: string;
  party_name: string;
  party_kind: PartyKind;
  chantier_hint: string;
  totals: ExtractTotals;
  lines: ExtractLine[];
  /** N° document lu sur le fichier, si présent. */
  document_number?: string;
  /** Date d’émission AAAA-MM-JJ si lue. */
  issue_date?: string;
  party_address?: string;
  /** Récap et auto-évaluation de lisibilité (modèle). */
  read_assessment?: ExtractReadAssessment;
};

export function emptyTotals(): ExtractTotals {
  return { ht: null, tva: null, ttc: null, eco_contribution: null, pmcb: null, weight_kg: null };
}

export function totalsFromExtract(extract: Record<string, unknown> | null | undefined): ExtractTotals {
  const raw = (extract?.totals ?? extract) as Record<string, unknown> | undefined;
  if (!raw || typeof raw !== "object") return emptyTotals();
  const num = (v: unknown) => {
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  return {
    ht: num(raw.ht ?? raw.total_ht),
    tva: num(raw.tva ?? raw.total_tva),
    ttc: num(raw.ttc ?? raw.total_ttc),
    eco_contribution: num(raw.eco_contribution ?? raw.eco),
    pmcb: num(raw.pmcb),
    weight_kg: num(raw.weight_kg ?? raw.poids),
  };
}

export const KIND_LABEL: Record<DocKind, string> = {
  devis: "Devis",
  facture: "Facture",
  bon_commande: "Bon de commande",
  bl: "Bon de livraison",
  bon_enlevement: "Bon d’enlèvement",
  autre: "Document",
};

export const CLIENT_OUT_LABEL: Record<ClientOutKind, string> = {
  devis: "Devis client",
  bon_commande: "Bon de commande client",
  bon_enlevement: "Bon d’enlèvement",
  facture: "Facture client",
};

/** Suite métier d’un devis déjà envoyé au client. */
export const CLIENT_DEVIS_NEXT_KINDS = ["bon_commande", "facture"] as const;
export type ClientDevisNextKind = (typeof CLIENT_DEVIS_NEXT_KINDS)[number];

/** 35 % de marge → coefficient 1,35. */
export function marginToMarkup(percent: number) {
  if (!Number.isFinite(percent)) return 1.35;
  return Math.round((1 + percent / 100) * 1000) / 1000;
}

export function parseDocKind(raw: string | undefined | null): DocKind | null {
  const k = String(raw ?? "");
  return k in KIND_LABEL ? (k as DocKind) : null;
}

export const DIRECTION_LABEL: Record<DocDirection, string> = {
  in: "Entrant (achat)",
  out: "Sortant (client)",
};

export const PARTY_LABEL: Record<PartyKind, string> = {
  client: "Client",
  fournisseur: "Fournisseur",
  distributeur: "Distributeur",
  atelier: "Atelier",
};
