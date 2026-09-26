import { RangeBar } from "@/components/admin/range-bar";
import { ActivityChart, Kpi, Panel } from "@/components/admin/ui";
import { formatDuration, n } from "@/lib/admin/format";
import { loadOverview, loadSessions } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";

export const metadata = { title: "Engagement" };

export default async function EngagementPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const range = parseRange(await searchParams);
  const [overview, sessions] = await Promise.all([loadOverview(range, "dau"), loadSessions(range)]);
  const pages = sessions.reduce((sum, session) => sum + session.pages, 0);
  const actions = sessions.reduce((sum, session) => sum + session.actions, 0);
  return (
    <>
      <RangeBar />
      <Panel className="mb-4">
        <div className="grid grid-cols-2 divide-x divide-line md:grid-cols-4">
          <Kpi label="Sessions" value={n(sessions.length)} hint="sur la période" />
          <Kpi label="Pages vues" value={n(pages)} hint="dans les sessions" />
          <Kpi label="Actions" value={n(actions)} hint="hors page view" />
          <Kpi
            label="Temps moyen"
            value={formatDuration(overview.kpis.time.now)}
            hint="par session"
          />
        </div>
      </Panel>
      <Panel title="DAU">
        <ActivityChart points={overview.series} />
      </Panel>
    </>
  );
}
