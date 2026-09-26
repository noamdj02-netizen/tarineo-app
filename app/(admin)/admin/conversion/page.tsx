import { RangeBar } from "@/components/admin/range-bar";
import { Kpi, Panel } from "@/components/admin/ui";
import { n, pct } from "@/lib/admin/format";
import { loadBusiness, loadOverview } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";

export const metadata = { title: "Conversion" };

export default async function ConversionPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const range = parseRange(await searchParams);
  const [overview, business] = await Promise.all([loadOverview(range), loadBusiness(range)]);
  return (
    <>
      <RangeBar />
      <Panel className="mb-4">
        <div className="grid grid-cols-2 divide-x divide-line md:grid-cols-3">
          <Kpi label="Comptes" value={n(business.users)} hint="au total" />
          <Kpi label="Payants" value={n(business.paid)} hint={pct(overview.kpis.conversion.now)} />
          <Kpi label="Nouveaux payants" value={n(business.newPaid)} hint="sur la période" />
        </div>
      </Panel>
      <Panel title="Funnel jusqu’à Pro">
        <ul>
          {overview.funnel.map((step) => (
            <li key={step.label} className="flex justify-between border-b border-line px-4 py-2.5 last:border-0">
              <span>{step.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {n(step.count)} · {step.share.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}%
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
