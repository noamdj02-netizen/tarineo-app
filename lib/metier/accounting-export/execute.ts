import type { InvoiceExportKind } from "@/components/tarineo/types";
import { sendEmailWithAttachment } from "@/lib/email/send";
import { buildCsvBuffer } from "@/lib/metier/accounting-export/csv";
import { filterInvoicesForExport } from "@/lib/metier/accounting-export/filter";
import { buildExportRows } from "@/lib/metier/accounting-export/rows";
import type { ExportFilters, ExportTrigger } from "@/lib/metier/accounting-export/types";
import type { DocumentCard } from "@/lib/metier/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export async function executeAccountingExport(input: {
  supabase: SupabaseClient<Database>;
  userId: string;
  trigger: ExportTrigger;
  scheduleId: string | null;
  periodStart: string;
  periodEnd: string;
  invoiceKinds: InvoiceExportKind[];
  distributorNames: string[];
  documents: DocumentCard[];
  emailTo: string | null;
  companyEmail?: string | null;
}): Promise<{ ok: true; runId: string; rowCount: number } | { ok: false; error: string }> {
  const filters: ExportFilters = {
    invoiceKinds: input.invoiceKinds,
    distributorNames: input.distributorNames,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
  };

  const filtered = filterInvoicesForExport(input.documents, {
    invoiceKinds: input.invoiceKinds,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    distributorNames: input.distributorNames,
  });
  const rows = buildExportRows(filtered);
  const csv = buildCsvBuffer(rows);
  const runId = crypto.randomUUID();
  const filePath = `${input.userId}/exports/${runId}.csv`;

  const { error: uploadError } = await input.supabase.storage.from("documents").upload(filePath, csv, {
    contentType: "text/csv",
    upsert: true,
  });
  if (uploadError) {
    return { ok: false, error: "Impossible d’enregistrer le fichier export." };
  }

  const to = (input.emailTo || input.companyEmail || "").trim();
  let emailStatus: "sent" | "skipped" | "failed" = "skipped";
  let emailError: string | null = null;

  if (to && rows.length > 0) {
    const subject = `Export comptable TARINEO — ${input.periodStart} → ${input.periodEnd}`;
    const text = `Bonjour,\n\nVotre export comptable TARINEO (${rows.length} ligne${rows.length > 1 ? "s" : ""}) est en pièce jointe.\n\nPériode : ${input.periodStart} au ${input.periodEnd}.\n\n— TARINEO`;
    const mail = await sendEmailWithAttachment({
      to,
      subject,
      text,
      filename: `tarineo-export-${input.periodStart}_${input.periodEnd}.csv`,
      content: csv,
      contentType: "text/csv",
      idempotencyKey: `export:${runId}`,
    });
    if (mail.skipped) {
      emailStatus = "skipped";
      emailError = mail.error ?? null;
    } else if (!mail.ok) {
      emailStatus = "failed";
      emailError = mail.error ?? "Envoi impossible.";
    } else {
      emailStatus = "sent";
    }
  }

  const { error: insertError } = await input.supabase.from("accounting_export_runs").insert({
    id: runId,
    user_id: input.userId,
    schedule_id: input.scheduleId,
    trigger: input.trigger,
    period_start: input.periodStart,
    period_end: input.periodEnd,
    filters: filters as Record<string, unknown>,
    row_count: rows.length,
    file_path: filePath,
    email_status: emailStatus,
    email_error: emailError,
  });

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  return { ok: true, runId, rowCount: rows.length };
}
