import type { DocKind } from "@/lib/metier/types";

export type LayoutHints = {
  header_markers?: string[];
  column_order?: string[];
  total_labels?: string[];
  date_format?: string;
  learned?: Record<string, unknown>[];
};

export type VendorDocumentProfile = {
  vendor_key: string;
  vendor_display_name: string;
  kind: DocKind | null;
  layout_hints: LayoutHints;
  prompt_addon: string;
  version: number;
  sample_count: number;
};

export type DocumentAgentMeta = {
  vendor_key: string;
  vendor_display_name: string;
  profile_version: number;
  confidence: "high" | "medium" | "low";
};

export type ReliabilityLevel = "fiable" | "a_verifier" | "peu_fiable";

export type DocumentRecapCheck = {
  id: string;
  label: string;
  ok: boolean;
  detail?: string;
};

export type DocumentRecap = {
  summary: string;
  reliability: ReliabilityLevel;
  score: number;
  checks: DocumentRecapCheck[];
  caveats: string[];
  stats: {
    lineCount: number;
    totalHt: number | null;
    linesSumHt: number | null;
    totalsAligned: boolean | null;
  };
};

export type StructuralHintDelta = {
  kind_corrected?: boolean;
  direction_corrected?: boolean;
  line_count_delta?: number;
  totals_ht_mismatch?: boolean;
  party_kind_corrected?: boolean;
};
