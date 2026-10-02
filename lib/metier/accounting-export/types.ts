import type { InvoiceExportKind } from "@/components/tarineo/types";

export type ExportFrequency = "monthly" | "quarterly" | "yearly";

export type ExportTrigger = "manual" | "scheduled";

export type ExportEmailStatus = "sent" | "skipped" | "failed";

export type ExportFilters = {
  invoiceKinds: InvoiceExportKind[];
  distributorNames: string[];
  periodStart: string;
  periodEnd: string;
};

export type AccountingExportSchedule = {
  id: string;
  user_id: string;
  enabled: boolean;
  frequency: ExportFrequency;
  day_of_month: number;
  invoice_kinds: InvoiceExportKind[];
  distributor_names: string[];
  format: "csv";
  email_to: string | null;
  next_run_at: string | null;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AccountingExportRun = {
  id: string;
  user_id: string;
  schedule_id: string | null;
  trigger: ExportTrigger;
  period_start: string;
  period_end: string;
  filters: ExportFilters;
  row_count: number;
  file_path: string | null;
  email_status: ExportEmailStatus;
  email_error: string | null;
  created_at: string;
};
