/**
 * Représentation canonique d’un devis avant persistence.
 * Tous les modes (manuel / voix / IA / document) convergent ici.
 */
export type DevisSource = "manual" | "voice" | "ai" | "document" | "template";

export type DevisVatMode = "standard" | "exempt";

export type ClientDraft = {
  id?: string | null;
  name: string;
  query?: string | null;
  address?: string | null;
};

export type ChantierDraft = {
  id?: string | null;
  name?: string | null;
  address?: string | null;
};

export type DevisLine = {
  description: string;
  quantity: number;
  unit?: string;
  unitPriceHT: number;
  vatRate: number;
  /** Champs manquants signalés par le parser (voix / IA). */
  missing?: string[];
  note?: string | null;
};

export type DevisDraft = {
  client: ClientDraft;
  chantier?: ChantierDraft;
  lines: DevisLine[];
  notes?: string;
  validityDays?: number;
  paymentTerms?: string;
  vatMode?: DevisVatMode;
  source: DevisSource;
  /** Titre / résumé affiché. */
  title?: string;
  /** Clé d’idempotence (double submit). */
  idempotencyKey?: string;
  /** Questions / warnings parser (voix). */
  questions?: string[];
  warnings?: string[];
};

export type QuoteLineTotal = {
  description: string;
  quantity: number;
  unit: string;
  unitPriceHT: number;
  vatRate: number;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
};

export type QuoteTotals = {
  lines: QuoteLineTotal[];
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
};
