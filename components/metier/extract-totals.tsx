import { totalsFromExtract, type ExtractTotals } from "@/lib/metier/types";
import { euro, frDec } from "@/lib/site/tarineo";

function cell(label: string, value: string | null) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="tabular-nums font-medium">{value ?? "Non indiqué"}</p>
    </div>
  );
}

export function ExtractTotalsGrid({ totals }: { totals: ExtractTotals }) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3 sm:grid-cols-4">
      {cell("Total HT", totals.ht != null ? euro(totals.ht) : null)}
      {cell("Éco-contribution", totals.eco_contribution != null ? euro(totals.eco_contribution) : null)}
      {cell("PMCB", totals.pmcb != null ? euro(totals.pmcb) : null)}
      {cell("Poids", totals.weight_kg != null ? `${frDec(totals.weight_kg, 1)}\u00a0kg` : null)}
    </div>
  );
}

export function ExtractTotalsFromDoc({ extract }: { extract: Record<string, unknown> }) {
  return <ExtractTotalsGrid totals={totalsFromExtract(extract)} />;
}
