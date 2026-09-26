import { RangeBar } from "@/components/admin/range-bar";
import { Kpi, Panel } from "@/components/admin/ui";
import { eur, n } from "@/lib/admin/format";
import { loadBusiness } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";

export const metadata = { title: "MRR" };

export default async function MrrPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const data = await loadBusiness(parseRange(await searchParams));
  return (
    <>
      <RangeBar />
      <Panel>
        <div className="grid grid-cols-2 divide-x divide-line">
          <Kpi label="MRR" value={eur(data.mrr)} hint="Création + Pro actifs" />
          <Kpi label="Payants" value={n(data.paid)} hint="hors fondateur one-shot" />
        </div>
      </Panel>
    </>
  );
}
