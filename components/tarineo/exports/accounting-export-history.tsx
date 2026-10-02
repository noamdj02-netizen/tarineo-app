"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import { useTransition } from "react";
import { getAccountingExportDownloadUrlAction } from "@/app/(app)/metier/actions";
import { Button } from "@/components/ui/button";
import type { AccountingExportRun } from "@/lib/metier/accounting-export/types";
import { cn } from "@/lib/utils";

const EMAIL_LABEL: Record<AccountingExportRun["email_status"], string> = {
  sent: "Envoyé",
  skipped: "Non envoyé",
  failed: "Échec",
};

const EMAIL_BADGE: Record<AccountingExportRun["email_status"], string> = {
  sent: "border-[#FF6B1A]/35 bg-[#FF6B1A]/10 text-[#8A3B0A]",
  skipped: "border-line bg-surface-2 text-muted-foreground",
  failed: "border-destructive/35 bg-destructive/10 text-destructive",
};

export function AccountingExportHistory({ runs }: { runs: AccountingExportRun[] }) {
  const [pending, start] = useTransition();

  if (!runs.length) {
    return (
      <div className="card-soft flex flex-col items-center gap-3 px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-[14px] bg-[#FF6B1A]/12 text-[#FF6B1A]" aria-hidden>
          <FileSpreadsheet className="size-6" />
        </span>
        <p className="font-display text-[17px] font-semibold text-ink">Aucun export pour l’instant</p>
        <p className="max-w-[36ch] text-[14px] text-muted-foreground">
          Lancez un export manuel ou activez une automatisation — chaque fichier reste disponible ici.
        </p>
      </div>
    );
  }

  return (
    <div className="card-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-[13px]">
          <thead className="border-b border-line bg-surface-2">
            <tr className="text-[12px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Période</th>
              <th className="px-4 py-3">Lignes</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3 text-right">Fichier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {runs.map((r) => (
              <tr key={r.id} className="bg-surface transition-colors hover:bg-surface-2/80">
                <td className="px-4 py-3.5 whitespace-nowrap text-ink">
                  {new Date(r.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                </td>
                <td className="px-4 py-3.5 font-mono text-[12px] text-ink">
                  {r.period_start}
                  <span className="text-muted-foreground"> → </span>
                  {r.period_end}
                </td>
                <td className="px-4 py-3.5 tabular-nums font-medium text-ink">{r.row_count}</td>
                <td className="px-4 py-3.5">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2 py-0.5 text-[11.5px] font-medium",
                      EMAIL_BADGE[r.email_status],
                    )}
                    title={r.email_error ?? undefined}
                  >
                    {EMAIL_LABEL[r.email_status]}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  {r.file_path ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-9 gap-1.5 rounded-full"
                      disabled={pending}
                      onClick={() =>
                        start(async () => {
                          const res = await getAccountingExportDownloadUrlAction(r.id);
                          if (res.ok) window.open(res.url, "_blank", "noopener,noreferrer");
                        })
                      }
                    >
                      <Download className="size-3.5" aria-hidden />
                      CSV
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
