import { RangeBar } from "@/components/admin/range-bar";
import { Panel } from "@/components/admin/ui";
import { n } from "@/lib/admin/format";
import { loadBusiness } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";

export const metadata = { title: "Abonnements" };

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const data = await loadBusiness(parseRange(await searchParams));
  return (
    <>
      <RangeBar />
      <Panel title="Répartition">
        <ul>
          {data.byPlan.map((row) => (
            <li key={row.plan} className="flex justify-between border-b border-line px-4 py-3 last:border-0">
              <span>{row.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {n(row.count)} comptes · {n(row.paid)} actifs
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
