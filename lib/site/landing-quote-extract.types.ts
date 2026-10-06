/** Payload sérialisable extraction → landing (sans données métier complètes). */

export type LandingExtractLine = {
  label: string;
  reference?: string;
  qty: number;
  unitPriceHT: number;
  vatRate: number;
};

export type LandingExtractPayload = {
  supplierName?: string;
  supplierAddress?: string;
  customerName?: string;
  customerAddress?: string;
  documentNumber?: string;
  issueDate?: string;
  sourceRef: string;
  lines: LandingExtractLine[];
  supplierTotalHT: number;
  quality: "fiable" | "partiel" | "incertain";
  caveats: string[];
  uncertain: boolean;
  summary?: string;
};
