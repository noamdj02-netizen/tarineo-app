import { RangeBar } from "@/components/admin/range-bar";
import { Empty, Panel } from "@/components/admin/ui";
import { n, pct } from "@/lib/admin/format";
import { loadCohorts } from "@/lib/admin/queries";

export const metadata = { title: "Cohortes" };

function cell(value: number | null) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  const bg = `color-mix(in srgb, var(--color-glow-2) ${Math.min(80, value)}%, white)`;
  return (
    <span className="inline-block min-w-[3.5rem] rounded-md px-2 py-1 tabular-nums" style={{ background: bg }}>
      {pct(value, 0)}
    </span>
  );
}

export default async function CohortsPage() {
  const rows = await loadCohorts();
  return (
    <>
      <RangeBar />
      <Panel title="Rétention par cohorte">
        {rows.every((row) => row.size === 0) ? (
          <Empty>Pas encore assez d’inscriptions pour une cohorte.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13.5px]">
              <thead className="border-b border-line font-mono text-[10.5px] tracking-[0.08em] text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2 font-medium">Cohorte</th>
                  <th className="px-4 py-2 font-medium">Taille</th>
                  <th className="px-4 py-2 font-medium">J0</th>
                  <th className="px-4 py-2 font-medium">J1</th>
                  <th className="px-4 py-2 font-medium">J7</th>
                  <th className="px-4 py-2 font-medium">J14</th>
                  <th className="px-4 py-2 font-medium">J30</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium">{row.label}</td>
                    <td className="px-4 py-3 tabular-nums">{n(row.size)}</td>
                    <td className="px-4 py-3">{cell(row.j0)}</td>
                    <td className="px-4 py-3">{cell(row.j1)}</td>
                    <td className="px-4 py-3">{cell(row.j7)}</td>
                    <td className="px-4 py-3">{cell(row.j14)}</td>
                    <td className="px-4 py-3">{cell(row.j30)}</td>
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
