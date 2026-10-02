"use client";

import { CalendarClock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteAccountingExportScheduleAction,
  saveAccountingExportScheduleAction,
  toggleAccountingExportScheduleAction,
} from "@/app/(app)/metier/actions";
import { TarineoSection } from "@/components/tarineo/cards/tarineo-section";
import { InvoiceTypeSelector } from "@/components/tarineo/exports/invoice-type-selector";
import { DistributorSelector } from "@/components/tarineo/suppliers/distributor-selector";
import type { InvoiceExportKind } from "@/components/tarineo/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AccountingExportSchedule, ExportFrequency } from "@/lib/metier/accounting-export/types";
import { adaptAnnualGoals } from "@/lib/tarineo/adapters";
import { cn } from "@/lib/utils";

const FREQUENCIES: { id: ExportFrequency; label: string; hint: string }[] = [
  { id: "monthly", label: "Mensuel", hint: "Mois civil précédent" },
  { id: "quarterly", label: "Trimestriel", hint: "Trimestre précédent" },
  { id: "yearly", label: "Annuel", hint: "Année civile précédente" },
];

export function AccountingExportScheduleForm({
  schedules,
  enseignes,
  defaultEmail,
}: {
  schedules: AccountingExportSchedule[];
  enseignes: { label: string; amount: number }[];
  defaultEmail: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const distributors = adaptAnnualGoals(enseignes);
  const [frequency, setFrequency] = useState<ExportFrequency>("monthly");
  const [dayOfMonth, setDayOfMonth] = useState(5);
  const [invoiceKinds, setInvoiceKinds] = useState<InvoiceExportKind[]>(["distributor"]);
  const [selectedDists, setSelectedDists] = useState<string[]>([]);
  const [emailTo, setEmailTo] = useState(defaultEmail);
  const [error, setError] = useState<string | null>(null);

  const distributorNames = distributors.filter((d) => selectedDists.includes(d.id)).map((d) => d.name);

  function save() {
    setError(null);
    start(async () => {
      const res = await saveAccountingExportScheduleAction({
        enabled: true,
        frequency,
        dayOfMonth,
        invoiceKinds,
        distributorNames,
        emailTo: emailTo.trim() || null,
      });
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <TarineoSection title="Nouvelle automatisation" description="Même filtres que l’export manuel, envoyés par e-mail.">
        <div className="flex flex-col gap-5 p-5">
          <div className="grid gap-2 sm:grid-cols-3">
            {FREQUENCIES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFrequency(f.id)}
                className={cn(
                  "flex flex-col items-start rounded-[12px] border px-3.5 py-3 text-left transition-colors",
                  frequency === f.id
                    ? "border-[#FF6B1A]/50 bg-[#FF6B1A]/8"
                    : "border-line bg-surface hover:bg-surface-2",
                )}
              >
                <span className="text-[14px] font-medium text-ink">{f.label}</span>
                <span className="mt-0.5 text-[12px] text-muted-foreground">{f.hint}</span>
              </button>
            ))}
          </div>
          <label className="text-[13px] font-medium text-ink">
            Jour d’envoi (1–28)
            <select
              className="mt-1.5 h-11 w-full max-w-[10rem] rounded-xl border border-line bg-surface px-3 text-[14px] text-ink"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(Number(e.target.value))}
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <InvoiceTypeSelector selected={invoiceKinds} onChange={setInvoiceKinds} />
          <DistributorSelector distributors={distributors} selectedIds={selectedDists} onChange={setSelectedDists} />
          <label className="text-[13px] font-medium text-ink">
            E-mail destinataire
            <Input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className="mt-1.5 h-11 rounded-xl"
              placeholder="compta@entreprise.fr"
            />
          </label>
          {error ? <p role="alert" className="text-[13px] text-destructive">{error}</p> : null}
          <Button
            type="button"
            disabled={pending}
            className="h-11 w-full rounded-[12px] bg-[#FF6B1A] text-[14px] font-medium text-white hover:brightness-[0.96] sm:w-auto sm:px-6"
            onClick={save}
          >
            {pending ? "Enregistrement…" : "Activer l’automatisation"}
          </Button>
        </div>
      </TarineoSection>

      <TarineoSection
        title="Planifications enregistrées"
        description={schedules.length ? undefined : "Aucune règle pour le moment."}
      >
        {schedules.length ? (
          <ul className="divide-y divide-line">
            {schedules.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="flex min-w-0 items-start gap-3">
                  <CalendarClock className="mt-0.5 size-4 shrink-0 text-[#FF6B1A]" aria-hidden />
                  <div className="min-w-0">
                    <p className="font-medium text-ink">
                      {FREQUENCIES.find((f) => f.id === s.frequency)?.label} · jour {s.day_of_month}
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                      {s.email_to || defaultEmail || "E-mail entreprise"}
                      {" · "}
                      <span className={s.enabled ? "text-[#C44F0A]" : "text-muted-foreground"}>
                        {s.enabled ? "Actif" : "En pause"}
                      </span>
                      {s.next_run_at
                        ? ` · Prochain : ${new Date(s.next_run_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-full"
                    onClick={() =>
                      start(async () => {
                        await toggleAccountingExportScheduleAction(s.id, !s.enabled);
                        router.refresh();
                      })
                    }
                  >
                    {s.enabled ? "Pause" : "Réactiver"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-9 rounded-full text-destructive hover:text-destructive"
                    onClick={() =>
                      start(async () => {
                        await deleteAccountingExportScheduleAction(s.id);
                        router.refresh();
                      })
                    }
                  >
                    Supprimer
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-[14px] text-muted-foreground">
            Créez une règle ci-dessus pour recevoir vos exports sans y penser.
          </p>
        )}
      </TarineoSection>
    </div>
  );
}
