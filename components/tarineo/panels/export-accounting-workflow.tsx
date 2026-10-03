"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Download, FileText, Store } from "lucide-react";
import { WorkflowStepCard } from "@/components/tarineo/exports/workflow-step-card";
import { DateRangePicker } from "@/components/tarineo/exports/date-range-picker";
import { DistributorSelector } from "@/components/tarineo/suppliers/distributor-selector";
import { InvoiceTypeSelector } from "@/components/tarineo/exports/invoice-type-selector";
import { ExportPreviewTable } from "@/components/tarineo/exports/export-preview-table";
import { ExportFormatSelector, type ExportFormat } from "@/components/tarineo/exports/export-format-selector";
import type { DateRangePreset, InvoiceExportKind } from "@/components/tarineo/types";
import type { DocumentCard } from "@/lib/metier/types";
import { adaptAnnualGoals } from "@/lib/tarineo/adapters";
import {
  buildCsvString,
  buildExportPreviewRows,
  buildExportRows,
  filterInvoicesForExport,
  resolveDateRangePreset,
} from "@/lib/metier/accounting-export";
import { euroInt } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

function downloadCsv(rows: Record<string, string | number>[], filename?: string) {
  if (!rows.length) return;
  const blob = new Blob([buildCsvString(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `tarineo-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportAccountingWorkflow({
  documents,
  enseignes,
  onRunServerExport,
}: {
  documents: DocumentCard[];
  enseignes: { label: string; amount: number }[];
  onRunServerExport?: (input: {
    periodStart: string;
    periodEnd: string;
    invoiceKinds: InvoiceExportKind[];
    distributorNames: string[];
  }) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [preset, setPreset] = useState<DateRangePreset>("year");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selectedDists, setSelectedDists] = useState<string[]>([]);
  const [invoiceKinds, setInvoiceKinds] = useState<InvoiceExportKind[]>(["distributor"]);
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [emailPending, setEmailPending] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  const distributors = adaptAnnualGoals(enseignes);

  const invoiceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of documents) {
      if (d.kind !== "facture" || d.direction !== "in") continue;
      const name = d.party_name?.trim() || "Autre";
      counts[name] = (counts[name] ?? 0) + 1;
    }
    return counts;
  }, [documents]);

  useEffect(() => {
    const range = resolveDateRangePreset("year");
    setStart(range.start);
    setEnd(range.end);
  }, []);

  useEffect(() => {
    if (preset === "custom") return;
    const range = resolveDateRangePreset(preset);
    setStart(range.start);
    setEnd(range.end);
  }, [preset]);

  const distributorNames = useMemo(() => {
    if (!selectedDists.length) return [];
    return distributors.filter((d) => selectedDists.includes(d.id)).map((d) => d.name);
  }, [selectedDists, distributors]);

  const filtered = useMemo(
    () =>
      filterInvoicesForExport(documents, {
        invoiceKinds,
        periodStart: start || undefined,
        periodEnd: end || undefined,
        distributorNames,
      }),
    [documents, invoiceKinds, start, end, distributorNames],
  );

  const preview = buildExportPreviewRows(filtered, 20);
  const fullRows = buildExportRows(filtered);
  const totalHt = fullRows.reduce((s, r) => s + Number(r.HT || 0), 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
      <div className="card-soft overflow-hidden">
        <WorkflowStepCard step="1" title="Sélectionnez la période" icon={Calendar}>
          <DateRangePicker
            preset={preset}
            onPresetChange={setPreset}
            start={start}
            end={end}
            onStartChange={(v) => {
              setPreset("custom");
              setStart(v);
            }}
            onEndChange={(v) => {
              setPreset("custom");
              setEnd(v);
            }}
          />
        </WorkflowStepCard>
        <WorkflowStepCard step="2" title="Choisissez vos distributeurs" icon={Store}>
          <DistributorSelector
            distributors={distributors}
            selectedIds={selectedDists}
            onChange={setSelectedDists}
            invoiceCounts={invoiceCounts}
          />
        </WorkflowStepCard>
        <WorkflowStepCard step="3" title="Type de factures à exporter" icon={FileText}>
          <InvoiceTypeSelector selected={invoiceKinds} onChange={setInvoiceKinds} />
        </WorkflowStepCard>
        <WorkflowStepCard step="5" title="Format d'export" icon={Download}>
          <ExportFormatSelector
            format={format}
            onChange={setFormat}
            disabled={!fullRows.length}
            onGenerate={() => downloadCsv(fullRows)}
          />
        </WorkflowStepCard>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-4">
        <div className="card-soft flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
            <div>
              <p className="font-display text-[17px] font-semibold tracking-tight text-ink">Aperçu</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {filtered.length} facture{filtered.length !== 1 ? "s" : ""} sélectionnée
                {filtered.length ? ` · HT total ${euroInt(totalHt)}` : ""}
              </p>
            </div>
            {start && end ? (
              <p className="rounded-full border border-line bg-surface-2 px-3 py-1 font-mono text-[11px] text-muted-foreground">
                {start} → {end}
              </p>
            ) : null}
          </div>

          {filtered.length ? (
            <ExportPreviewTable rows={preview} />
          ) : (
            <p className="rounded-xl border border-dashed border-line bg-surface-2 px-4 py-8 text-center text-[14px] text-muted-foreground">
              Aucune facture pour ces filtres. Élargissez la période ou changez le type de factures.
            </p>
          )}

          <p className="text-[12px] text-muted-foreground">Aperçu limité aux 20 premières lignes.</p>
        </div>

        <div className="card-soft flex flex-col gap-4 p-5">
          <p className="font-display text-[17px] font-semibold tracking-tight text-ink">Télécharger ou envoyer</p>
          {onRunServerExport ? (
            <button
              type="button"
              disabled={!fullRows.length || emailPending}
              className="inline-flex h-11 w-full items-center justify-center rounded-[12px] border border-line bg-surface text-[13.5px] font-medium text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B1A]/35 disabled:opacity-50 sm:w-auto sm:px-5"
              onClick={() => {
                setEmailPending(true);
                setEmailMsg(null);
                void onRunServerExport({
                  periodStart: start,
                  periodEnd: end,
                  invoiceKinds,
                  distributorNames,
                }).then((res) => {
                  setEmailPending(false);
                  setEmailMsg(
                    res.ok ? "Export enregistré dans l’historique. E-mail envoyé si Resend est configuré." : res.error ?? "Échec.",
                  );
                });
              }}
            >
              {emailPending ? "Envoi en cours…" : "Enregistrer et envoyer par e-mail"}
            </button>
          ) : null}
          {emailMsg ? (
            <p className={cn("text-[13px]", emailMsg.includes("Échec") ? "text-destructive" : "text-muted-foreground")}>
              {emailMsg}
            </p>
          ) : null}
          {format === "xlsx" ? (
            <p className="text-[12px] text-muted-foreground">Excel : fichier CSV téléchargé (ouvrir dans Excel).</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
