import { ActivityToggle } from "@/components/admin/activity-toggle";
import { RangeBar } from "@/components/admin/range-bar";
import { ActivityChart, Funnel, Kpi, Panel } from "@/components/admin/ui";
import { delta, eur, formatDuration, n, pct } from "@/lib/admin/format";
import { loadOverview } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";

export const metadata = { title: "Vue générale" };

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string; activity?: string }>;
}) {
  const q = await searchParams;
  const range = parseRange(q);
  const activity = q.activity === "wau" || q.activity === "mau" ? q.activity : "dau";
  const data = await loadOverview(range, activity);
  const k = data.kpis;
  const active = delta(k.active.now, k.active.prev);
  const neu = delta(k.newcomers.now, k.newcomers.prev);
  const ses = delta(k.sessions.now, k.sessions.prev);
  const time = delta(k.time.now / 1000, k.time.prev / 1000, "min");
  const act = delta(k.activation.now, k.activation.prev, "pp");
  const conv = delta(k.conversion.now, k.conversion.prev, "pp");
  const mrr = delta(k.mrr.now, k.mrr.prev);
  const churn = delta(k.churn.now, k.churn.prev, "pp");

  return (
    <>
      <RangeBar />
      <Panel className="mb-4">
        <div className="grid grid-cols-2 divide-x divide-y divide-line md:grid-cols-4">
          <Kpi label="Utilisateurs actifs" value={n(k.active.now)} hint={active.text} up={active.up} down={active.down} />
          <Kpi label="Nouveaux utilisateurs" value={n(k.newcomers.now)} hint={neu.text} up={neu.up} down={neu.down} />
          <Kpi label="Sessions" value={n(k.sessions.now)} hint={ses.text} up={ses.up} down={ses.down} />
          <Kpi label="Temps moyen" value={formatDuration(k.time.now)} hint={time.text} up={time.up} down={time.down} />
          <Kpi label="Activation" value={pct(k.activation.now)} hint={act.text} up={act.up} down={act.down} />
          <Kpi label="Conversion Pro" value={pct(k.conversion.now)} hint={conv.text} up={conv.up} down={conv.down} />
          <Kpi label="MRR" value={eur(k.mrr.now)} hint={mrr.text} up={mrr.up} down={mrr.down} />
          <Kpi label="Churn" value={pct(k.churn.now)} hint={churn.text} up={churn.down} down={churn.up} />
        </div>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
        <Panel title="Activité utilisateurs" action={<ActivityToggle />}>
          <ActivityChart points={data.series} />
        </Panel>
        <Panel title="Où les utilisateurs décrochent">
          <Funnel steps={data.funnel} />
        </Panel>
      </div>
    </>
  );
}
