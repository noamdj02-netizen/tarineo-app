import Link from "next/link";
import { RangeBar } from "@/components/admin/range-bar";
import { Empty, Panel } from "@/components/admin/ui";
import { FEATURE_LABEL, type FeatureKey } from "@/lib/analytics/catalog";
import { formatDuration, formatWhen } from "@/lib/admin/format";
import { loadSessions } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";

export const metadata = { title: "Sessions" };

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const sessions = await loadSessions(parseRange(await searchParams));
  return (
    <>
      <RangeBar />
      <Panel title={`Sessions · ${sessions.length}`}>
        {sessions.length === 0 ? (
          <Empty>Aucune session trackée sur cette période. Les nouvelles visites s’écrivent ici.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-[13.5px]">
              <thead className="border-b border-line font-mono text-[10.5px] tracking-[0.08em] text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2 font-medium">Utilisateur</th>
                  <th className="px-4 py-2 text-right font-medium">Durée</th>
                  <th className="px-4 py-2 text-right font-medium">Pages</th>
                  <th className="px-4 py-2 text-right font-medium">Actions</th>
                  <th className="px-4 py-2 font-medium">Feature principale</th>
                  <th className="px-4 py-2 font-medium">Sortie</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/sessions/${session.id}`} className="font-medium underline-offset-2 hover:underline">
                        {session.label}
                      </Link>
                      <p className="text-[12px] text-muted-foreground">{formatWhen(session.start)}</p>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatDuration(session.durationMs)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{session.pages}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{session.actions}</td>
                    <td className="px-4 py-2.5">
                      {FEATURE_LABEL[session.feature as FeatureKey] ?? session.feature}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{session.exit}</td>
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
