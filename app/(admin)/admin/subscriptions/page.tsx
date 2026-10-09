import { RangeBar } from "@/components/admin/range-bar";
import { Empty, Panel } from "@/components/admin/ui";
import { formatWhen, n } from "@/lib/admin/format";
import { loadBusiness } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";
import { PLAN_LABEL } from "@/lib/billing/plans";

export const metadata = { title: "Abonnements" };

function daysLabel(days: number | null, trial: boolean) {
  if (days == null) return "—";
  if (days === 0) return trial ? "Trial fini" : "Échu";
  return `${days} j${trial ? " (trial)" : ""}`;
}

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const data = await loadBusiness(parseRange(await searchParams));
  return (
    <>
      <RangeBar />
      <Panel title="Répartition" className="mb-4">
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
      <Panel title={`Périodes · ${data.withPeriod.length}`}>
        {data.withPeriod.length === 0 ? (
          <Empty>Aucun abonnement ou trial avec période.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13.5px]">
              <thead className="border-b border-line font-mono text-[10.5px] tracking-[0.08em] text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2 font-medium">Compte</th>
                  <th className="px-4 py-2 font-medium">Plan</th>
                  <th className="px-4 py-2 font-medium">Statut</th>
                  <th className="px-4 py-2 font-medium">Fin période</th>
                  <th className="px-4 py-2 font-medium">Restant</th>
                </tr>
              </thead>
              <tbody>
                {data.withPeriod.map((row) => (
                  <tr key={row.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-2.5">
                      <p className="font-medium">{row.name}</p>
                      <p className="text-[12px] text-muted-foreground">{row.email}</p>
                    </td>
                    <td className="px-4 py-2.5">{PLAN_LABEL[row.plan]}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {row.status}
                      {row.cancelAtPeriodEnd ? " · annule fin période" : ""}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {row.periodEnd ? formatWhen(row.periodEnd) : "—"}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">
                      {daysLabel(row.daysRemaining, row.isFreeTrial)}
                    </td>
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
