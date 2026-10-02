import { CalendarClock, FileSpreadsheet, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export function AccountingExportSummary({
  invoiceCount,
  activeSchedules,
  lastExportLabel,
  className,
}: {
  invoiceCount: number;
  activeSchedules: number;
  lastExportLabel: string | null;
  className?: string;
}) {
  const items = [
    {
      icon: FileSpreadsheet,
      label: "Factures en base",
      value: String(invoiceCount),
      hint: "Prêtes pour export",
    },
    {
      icon: CalendarClock,
      label: "Automatisations actives",
      value: String(activeSchedules),
      hint: activeSchedules ? "Envoi programmé" : "Aucune pour l’instant",
    },
    {
      icon: Mail,
      label: "Dernier export",
      value: lastExportLabel ?? "—",
      hint: lastExportLabel ? "Voir l’historique" : "Pas encore d’export",
    },
  ];

  return (
    <ul
      className={cn(
        "grid gap-3 sm:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-start gap-3 rounded-[14px] border border-line bg-surface px-4 py-3.5 shadow-soft"
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#FF6B1A]/12 text-[#FF6B1A]"
            aria-hidden
          >
            <item.icon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-muted-foreground">{item.label}</p>
            <p className="mt-0.5 font-display text-[20px] font-semibold tabular-nums leading-tight tracking-tight text-ink">
              {item.value}
            </p>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">{item.hint}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
