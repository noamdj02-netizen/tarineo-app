import { RangeBar } from "@/components/admin/range-bar";
import { Empty, Panel } from "@/components/admin/ui";
import { n, pct } from "@/lib/admin/format";
import { loadFeatures } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";

export const metadata = { title: "Features" };

export default async function FeaturesPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const rows = await loadFeatures(parseRange(await searchParams));
  return (
    <>
      <RangeBar />
      <Panel title="Utilisée → revient → achète">
        {rows.every((row) => row.users === 0) ? (
          <Empty>Les ouvertures de pages et d’actions remplissent ce tableau.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13.5px]">
              <thead className="border-b border-line font-mono text-[10.5px] tracking-[0.08em] text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2 font-medium">Feature</th>
                  <th className="px-4 py-2 text-right font-medium">Utilisation</th>
                  <th className="px-4 py-2 text-right font-medium">Retour J+7</th>
                  <th className="px-4 py-2 text-right font-medium">Conversion</th>
                  <th className="px-4 py-2 text-right font-medium">Users</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium">{row.label}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{pct(row.usage)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{pct(row.return7)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{pct(row.conversion)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{n(row.users)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
