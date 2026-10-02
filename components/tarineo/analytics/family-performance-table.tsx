import type { FamilyPerformanceRow } from "@/components/tarineo/types";
import { euroInt } from "@/lib/site/tarineo";

export function FamilyPerformanceTable({ rows }: { rows: FamilyPerformanceRow[] }) {
  if (!rows.length) {
    return <p className="p-4 text-[13px] text-muted-foreground">Aucune famille à afficher.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-line text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">Article / famille</th>
            <th className="px-4 py-2.5 font-medium">Montant HT</th>
            <th className="px-4 py-2.5 font-medium">Part</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.family} className="border-b border-line last:border-0">
              <td className="px-4 py-2.5 font-medium text-ink">{r.family}</td>
              <td className="px-4 py-2.5 tabular-nums text-ink">{euroInt(r.amountHt)}</td>
              <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{r.sharePct} %</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
