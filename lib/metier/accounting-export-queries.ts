import "server-only";

import type { InvoiceExportKind } from "@/components/tarineo/types";
import { getDb } from "@/lib/db";
import { executeAccountingExport } from "@/lib/metier/accounting-export/execute";
import { previousPeriod } from "@/lib/metier/accounting-export/period";
import { computeNextRun } from "@/lib/metier/accounting-export/schedule";
import type {
  AccountingExportRun,
  AccountingExportSchedule,
  ExportFrequency,
} from "@/lib/metier/accounting-export/types";
import { getCompanyProfileForUser, listDocumentsForUser } from "@/lib/metier/documents-for-user";
import { getCompanyProfile, listDocuments } from "@/lib/metier/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function isMissingTable(error: { message?: string; code?: string } | null) {
  const m = error?.message ?? "";
  return error?.code === "42P01" || /does not exist/i.test(m);
}

function mapSchedule(row: Record<string, unknown>): AccountingExportSchedule {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    enabled: Boolean(row.enabled),
    frequency: row.frequency as ExportFrequency,
    day_of_month: Number(row.day_of_month),
    invoice_kinds: (row.invoice_kinds as InvoiceExportKind[]) ?? ["distributor"],
    distributor_names: (row.distributor_names as string[]) ?? [],
    format: "csv",
    email_to: row.email_to ? String(row.email_to) : null,
    next_run_at: row.next_run_at ? String(row.next_run_at) : null,
    last_run_at: row.last_run_at ? String(row.last_run_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function mapRun(row: Record<string, unknown>): AccountingExportRun {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    schedule_id: row.schedule_id ? String(row.schedule_id) : null,
    trigger: row.trigger as AccountingExportRun["trigger"],
    period_start: String(row.period_start),
    period_end: String(row.period_end),
    filters: (row.filters ?? {}) as AccountingExportRun["filters"],
    row_count: Number(row.row_count ?? 0),
    file_path: row.file_path ? String(row.file_path) : null,
    email_status: row.email_status as AccountingExportRun["email_status"],
    email_error: row.email_error ? String(row.email_error) : null,
    created_at: String(row.created_at),
  };
}

export async function listAccountingExportSchedules(): Promise<AccountingExportSchedule[]> {
  const db = await getDb();
  if (!db) return [];
  const { data, error } = await db.supabase
    .from("accounting_export_schedules")
    .select("*")
    .eq("user_id", db.user.id)
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingTable(error)) return [];
    console.error("[accounting-export] listSchedules", error);
    return [];
  }
  return (data ?? []).map((r) => mapSchedule(r as Record<string, unknown>));
}

export async function listAccountingExportRuns(limit = 20): Promise<AccountingExportRun[]> {
  const db = await getDb();
  if (!db) return [];
  const { data, error } = await db.supabase
    .from("accounting_export_runs")
    .select("*")
    .eq("user_id", db.user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    if (isMissingTable(error)) return [];
    console.error("[accounting-export] listRuns", error);
    return [];
  }
  return (data ?? []).map((r) => mapRun(r as Record<string, unknown>));
}

export async function upsertAccountingExportSchedule(input: {
  id?: string;
  enabled: boolean;
  frequency: ExportFrequency;
  dayOfMonth: number;
  invoiceKinds: InvoiceExportKind[];
  distributorNames: string[];
  emailTo: string | null;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Non connecté." };
  if (input.enabled) {
    const { FeatureNotAllowedError, requireFeature } = await import("@/lib/billing/entitlements");
    try {
      await requireFeature(db, "accounting_export_auto");
    } catch (err) {
      if (err instanceof FeatureNotAllowedError) return { ok: false, error: err.message };
      throw err;
    }
  }
  const next_run_at = computeNextRun({ frequency: input.frequency, dayOfMonth: input.dayOfMonth });
  const payload = {
    user_id: db.user.id,
    enabled: input.enabled,
    frequency: input.frequency,
    day_of_month: input.dayOfMonth,
    invoice_kinds: input.invoiceKinds,
    distributor_names: input.distributorNames,
    format: "csv",
    email_to: input.emailTo,
    next_run_at,
  };
  if (input.id) {
    const { error } = await db.supabase
      .from("accounting_export_schedules")
      .update(payload)
      .eq("id", input.id)
      .eq("user_id", db.user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: input.id };
  }
  const { data, error } = await db.supabase.from("accounting_export_schedules").insert(payload).select("id").single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data.id };
}

export async function deleteAccountingExportSchedule(id: string) {
  const db = await getDb();
  if (!db) return { ok: false as const, error: "Non connecté." };
  const { error } = await db.supabase
    .from("accounting_export_schedules")
    .delete()
    .eq("id", id)
    .eq("user_id", db.user.id);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function toggleAccountingExportSchedule(id: string, enabled: boolean) {
  const db = await getDb();
  if (!db) return { ok: false as const, error: "Non connecté." };
  if (enabled) {
    const { FeatureNotAllowedError, requireFeature } = await import("@/lib/billing/entitlements");
    try {
      await requireFeature(db, "accounting_export_auto");
    } catch (err) {
      if (err instanceof FeatureNotAllowedError) return { ok: false as const, error: err.message };
      throw err;
    }
  }
  const { error } = await db.supabase
    .from("accounting_export_schedules")
    .update({ enabled })
    .eq("id", id)
    .eq("user_id", db.user.id);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function getAccountingExportDownloadUrl(runId: string) {
  const db = await getDb();
  if (!db) return { ok: false as const, error: "Non connecté." };
  const { data, error } = await db.supabase
    .from("accounting_export_runs")
    .select("file_path")
    .eq("id", runId)
    .eq("user_id", db.user.id)
    .maybeSingle();
  if (error || !data?.file_path) return { ok: false as const, error: "Export introuvable." };
  const signed = await db.supabase.storage.from("documents").createSignedUrl(data.file_path, 3600);
  if (signed.error || !signed.data?.signedUrl) return { ok: false as const, error: "Lien indisponible." };
  return { ok: true as const, url: signed.data.signedUrl };
}

export async function runManualAccountingExport(input: {
  periodStart: string;
  periodEnd: string;
  invoiceKinds: InvoiceExportKind[];
  distributorNames: string[];
  emailTo?: string | null;
}) {
  const db = await getDb();
  if (!db) return { ok: false as const, error: "Non connecté." };
  const [documents, company] = await Promise.all([listDocuments(), getCompanyProfile()]);
  const res = await executeAccountingExport({
    supabase: db.supabase,
    userId: db.user.id,
    trigger: "manual",
    scheduleId: null,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    invoiceKinds: input.invoiceKinds,
    distributorNames: input.distributorNames,
    documents,
    emailTo: input.emailTo ?? null,
    companyEmail: company?.email_contact ?? null,
  });
  if (!res.ok) return res;
  return { ok: true as const, runId: res.runId, rowCount: res.rowCount };
}

export async function processDueAccountingExports() {
  if (!isSupabaseConfigured()) return { processed: 0 };
  const admin = createAdminClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await admin
    .from("accounting_export_schedules")
    .select("*")
    .eq("enabled", true)
    .lte("next_run_at", nowIso);
  if (error) {
    if (isMissingTable(error)) return { processed: 0 };
    console.error("[cron] accounting_export_schedules", error);
    return { processed: 0, error: error.message };
  }

  let processed = 0;
  for (const raw of data ?? []) {
    const schedule = mapSchedule(raw as Record<string, unknown>);
    try {
      const { canUseFeature } = await import("@/lib/billing/entitlements");
      const { planForUserId } = await import("@/lib/billing/plan");
      const plan = await planForUserId(schedule.user_id);
      if (!canUseFeature(plan, "accounting_export_auto")) continue;

      const period = previousPeriod(schedule.frequency);
      const docs = await listDocumentsForUser(admin, schedule.user_id);
      const company = await getCompanyProfileForUser(admin, schedule.user_id);
      const res = await executeAccountingExport({
        supabase: admin,
        userId: schedule.user_id,
        trigger: "scheduled",
        scheduleId: schedule.id,
        periodStart: period.start,
        periodEnd: period.end,
        invoiceKinds: schedule.invoice_kinds,
        distributorNames: schedule.distributor_names,
        documents: docs,
        emailTo: schedule.email_to,
        companyEmail: company?.email_contact ?? null,
      });
      if (!res.ok) {
        console.error("[cron] export", schedule.id, res.error);
        continue;
      }
      const next = computeNextRun({
        frequency: schedule.frequency,
        dayOfMonth: schedule.day_of_month,
        from: new Date(),
      });
      await admin
        .from("accounting_export_schedules")
        .update({ next_run_at: next, last_run_at: nowIso })
        .eq("id", schedule.id)
        .eq("user_id", schedule.user_id);
      processed += 1;
    } catch (err) {
      console.error("[cron] accounting export", schedule.id, err);
    }
  }
  return { processed };
}
