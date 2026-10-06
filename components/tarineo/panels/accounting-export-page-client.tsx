"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { History, SlidersHorizontal, Zap } from "lucide-react";
import { runAccountingExportNowAction } from "@/app/(app)/metier/actions";
import { AccountingExportHistory } from "@/components/tarineo/exports/accounting-export-history";
import { AccountingExportScheduleForm } from "@/components/tarineo/exports/accounting-export-schedule-form";
import { AccountingExportSummary } from "@/components/tarineo/exports/accounting-export-summary";
import { ExportAccountingWorkflow } from "@/components/tarineo/panels/export-accounting-workflow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AccountingExportRun, AccountingExportSchedule } from "@/lib/metier/accounting-export/types";
import type { DocumentCard } from "@/lib/metier/types";
import { cn } from "@/lib/utils";

function ExportTabTrigger({
  value,
  icon: Icon,
  label,
  badge,
}: {
  value: string;
  icon: typeof SlidersHorizontal;
  label: string;
  badge?: ReactNode;
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "relative flex !h-11 min-h-[44px] w-full flex-none items-center justify-center gap-2 rounded-[11px] border border-transparent px-3 sm:flex-1 sm:px-4",
        "text-[13.5px] font-medium text-muted-foreground transition-[color,background-color,box-shadow,border-color] duration-150",
        "hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B1A]/35",
        "data-active:border-line data-active:bg-surface data-active:text-ink data-active:shadow-soft",
        "data-active:[&_svg]:text-[#FF6B1A] data-active:[&_svg]:opacity-100",
        "after:!hidden",
      )}
    >
      <Icon className="size-4 shrink-0 opacity-65" aria-hidden />
      <span className="truncate">{label}</span>
      {badge}
    </TabsTrigger>
  );
}

export function AccountingExportPageClient({
  documents,
  enseignes,
  schedules,
  runs,
  defaultEmail,
  invoiceCount,
  activeSchedules,
  lastExportLabel,
  canAccountingAuto,
}: {
  documents: DocumentCard[];
  enseignes: { label: string; amount: number }[];
  schedules: AccountingExportSchedule[];
  runs: AccountingExportRun[];
  defaultEmail: string;
  invoiceCount: number;
  activeSchedules: number;
  lastExportLabel: string | null;
  canAccountingAuto: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-8">
      <AccountingExportSummary
        invoiceCount={invoiceCount}
        activeSchedules={activeSchedules}
        lastExportLabel={lastExportLabel}
      />

      <div className="rounded-[14px] border border-line/80 bg-wash-orange/40 px-4 py-3 text-[13px] leading-relaxed text-ink">
        <span className="font-medium">Rappel :</span> le traitement automatique tourne une fois par jour (8 h). L’export
        part le jour choisi pour la période précédente, avec le fichier CSV en pièce jointe.
      </div>

      <Tabs defaultValue="manual" className="flex flex-col gap-6">
        <TabsList
          variant="line"
          className={cn(
            "!h-auto !min-h-0 w-full max-w-none",
            "flex flex-col gap-1.5 rounded-[14px] border border-line bg-surface-2 p-1.5",
            "sm:flex-row sm:items-stretch sm:justify-stretch sm:gap-1.5",
            "bg-surface-2",
          )}
        >
          <ExportTabTrigger value="manual" icon={SlidersHorizontal} label="Export manuel" />
          <ExportTabTrigger
            value="auto"
            icon={Zap}
            label="Automatisation"
            badge={
              activeSchedules > 0 ? (
                <span
                  className="rounded-full bg-[#FF6B1A]/15 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#C44F0A]"
                  aria-label={`${activeSchedules} automatisation active`}
                >
                  {activeSchedules}
                </span>
              ) : null
            }
          />
          <ExportTabTrigger
            value="history"
            icon={History}
            label="Historique"
            badge={
              runs.length > 0 ? (
                <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                  {runs.length}
                </span>
              ) : null
            }
          />
        </TabsList>

        <TabsContent value="manual" className="mt-0 focus-visible:outline-none">
          <ExportAccountingWorkflow
            documents={documents}
            enseignes={enseignes}
            onRunServerExport={(input) =>
              runAccountingExportNowAction({
                ...input,
                emailTo: defaultEmail || null,
              })
            }
          />
        </TabsContent>
        <TabsContent value="auto" className="mt-0 focus-visible:outline-none">
          {canAccountingAuto ? (
            <AccountingExportScheduleForm schedules={schedules} enseignes={enseignes} defaultEmail={defaultEmail} />
          ) : (
            <div className="rounded-[14px] border border-line bg-surface p-6 text-[14px] leading-relaxed text-muted-foreground">
              L’envoi automatique du CSV à votre comptable est réservé au plan{" "}
              <span className="font-medium text-ink">Pro</span>. L’export manuel reste disponible dans l’onglet
              précédent.
              <Link href="/parametres/abonnement" className="ml-1 font-medium text-[#FF6B1A] hover:underline">
                Passer à Pro
              </Link>
            </div>
          )}
        </TabsContent>
        <TabsContent value="history" className="mt-0 focus-visible:outline-none">
          <AccountingExportHistory runs={runs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
