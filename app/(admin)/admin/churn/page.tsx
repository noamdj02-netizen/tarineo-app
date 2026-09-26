import { RangeBar } from "@/components/admin/range-bar";
import { Bars, Empty, Panel } from "@/components/admin/ui";
import { n, pct } from "@/lib/admin/format";
import { loadChurn } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";

export const metadata = { title: "Churn" };

export default async function ChurnPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const data = await loadChurn(parseRange(await searchParams));
  const total = Math.max(1, data.reasons.reduce((sum, row) => sum + row.count, 0));
  return (
    <>
      <RangeBar />
      <Panel title={`Utilisateurs perdus — ${n(data.lost)}`} className="mb-4">
        {data.lost === 0 ? (
          <Empty>Personne n’est inactif sur cette lecture.</Empty>
        ) : (
          <ul>
            {data.reasons.map((row) => (
              <li key={row.label} className="flex items-baseline justify-between gap-4 border-b border-line px-4 py-3 last:border-0">
                <span className="text-[14px]">{row.label}</span>
                <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
                  {pct((row.count / total) * 100)} · {n(row.count)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Dernière action avant départ">
        <Bars rows={data.lastAction} />
      </Panel>
    </>
  );
}
