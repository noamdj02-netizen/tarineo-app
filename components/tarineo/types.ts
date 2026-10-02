export type TarineoProduct = {
  id: string;
  name: string;
  supplierRef?: string | null;
  distributorRef?: string | null;
  unit?: string;
  lastPriceHt?: number | null;
};

export type TarineoDistributor = {
  id: string;
  name: string;
  amountHt?: number;
  goalHt?: number | null;
};

export type PriceHistoryPoint = {
  date: string;
  priceHt: number;
  label?: string;
};

export type QuoteStatusKey = "sent" | "followup" | "accepted" | "refused";

export type QuoteStatsData = Record<QuoteStatusKey, number>;

export type SalesPoint = {
  key: string;
  label: string;
  amount: number;
};

export type FamilyPerformanceRow = {
  family: string;
  amountHt: number;
  sharePct: number;
  trendPct?: number | null;
};

export type RecommendedAction = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon?: "alert" | "file" | "chart" | "truck";
};

export type SupplierQuoteLine = {
  id: string;
  name: string;
  reference?: string | null;
  priceHt: number;
  unit?: string;
};

export type ExportRow = Record<string, string | number>;

export type DateRangePreset = "month" | "quarter" | "year" | "last_year" | "custom";

export type InvoiceExportKind = "distributor" | "client";
