import Link from "next/link";
import { RangeBar } from "@/components/admin/range-bar";
import { Empty, Kpi, Panel } from "@/components/admin/ui";
import { formatWhen, n } from "@/lib/admin/format";
import { loadCockpit } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";
import { PLAN_LABEL } from "@/lib/billing/plans";

export const metadata = { title: "Cockpit" };

function daysLabel(days: number | null, trial: boolean) {
  if (days == null) return "—";
  if (days === 0) return trial ? "Trial fini" : "Échu";
  return `${days} j${trial ? " (trial)" : ""}`;
}

export default async function CockpitPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const range = parseRange(await searchParams);
  const data = await loadCockpit(range);
  const { kpis, accounts } = data;

  return (
    <>
      <RangeBar />
      <Panel className="mb-4">
        <div className="grid grid-cols-2 divide-x divide-y divide-line md:grid-cols-3 lg:grid-cols-6">
          <Kpi label="Actifs" value={n(kpis.activeUsers)} hint="sur la période" />
          <Kpi label="Trials" value={n(kpis.trials)} hint="Pro en essai" />
          <Kpi label="Pro / Founder" value={n(kpis.paidPro)} hint="payants" />
          <Kpi label="Starter" value={n(kpis.paidStarter)} hint="payants" />
          <Kpi label="Analyses docs" value={n(kpis.analyses)} hint="ingest + confirm + pièces" />
          <Kpi label="Erreurs" value={n(kpis.errors)} hint="IA + transform" />
        </div>
      </Panel>

      <Panel title={`Comptes · usage · ${accounts.length}`} className="mb-4">
        {accounts.length === 0 ? (
          <Empty>Aucun compte.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-[13.5px]">
              <thead className="border-b border-line font-mono text-[10.5px] tracking-[0.08em] text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2 font-medium">Utilisateur</th>
                  <th className="px-4 py-2 font-medium">Plan</th>
                  <th className="px-4 py-2 font-medium">Restant</th>
                  <th className="px-4 py-2 font-medium">Sessions</th>
                  <th className="px-4 py-2 font-medium">Pages</th>
                  <th className="px-4 py-2 font-medium">Analyses</th>
                  <th className="px-4 py-2 font-medium">Docs / mois</th>
                  <th className="px-4 py-2 font-medium">Erreurs</th>
                  <th className="px-4 py-2 font-medium">Vu</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((row) => (
                  <tr key={row.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-2.5">
                      <p className="font-medium">{row.name}</p>
                      <p className="text-[12px] text-muted-foreground">{row.email || "—"}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-medium">{PLAN_LABEL[row.plan]}</span>
                      {row.isFreeTrial ? (
                        <span className="ml-1.5 text-[11px] text-tarineo-orange">trial</span>
                      ) : null}
                      {row.cancelAtPeriodEnd ? (
                        <span className="ml-1.5 text-[11px] text-muted-foreground">fin période</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                      {daysLabel(row.daysRemaining, row.isFreeTrial)}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums">{n(row.sessions)}</td>
                    <td className="px-4 py-2.5 tabular-nums">{n(row.pageViews)}</td>
                    <td className="px-4 py-2.5 tabular-nums">{n(row.analyses)}</td>
                    <td className="px-4 py-2.5 tabular-nums">{n(row.docsThisMonth)}</td>
                    <td className="px-4 py-2.5 tabular-nums">{n(row.errors)}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {row.lastSeen ? formatWhen(row.lastSeen) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="text-[13px] text-muted-foreground">
        Détail :{" "}
        <Link href="/admin/subscriptions" className="underline underline-offset-2">
          abonnements
        </Link>
        {" · "}
        <Link href="/admin/errors" className="underline underline-offset-2">
          erreurs
        </Link>
        {" · "}
        <Link href="/admin/ai" className="underline underline-offset-2">
          IA
        </Link>
        {" · "}
        <Link href="/admin/tracking" className="underline underline-offset-2">
          tracking
        </Link>
      </p>
    </>
  );
}
