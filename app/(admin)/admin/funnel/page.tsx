import { RangeBar } from "@/components/admin/range-bar";
import { Funnel, Panel } from "@/components/admin/ui";
import { loadOverview } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";

export const metadata = { title: "Funnel" };

export default async function FunnelPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const data = await loadOverview(parseRange(await searchParams));
  return (
    <>
      <RangeBar />
      <Panel title="Où TARINEO perd ses utilisateurs">
        <Funnel steps={data.funnel} />
      </Panel>
    </>
  );
}
