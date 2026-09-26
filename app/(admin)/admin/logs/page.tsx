import { RangeBar } from "@/components/admin/range-bar";
import { Empty, Panel } from "@/components/admin/ui";
import { formatWhen } from "@/lib/admin/format";
import { loadEventsFeed } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";

export const metadata = { title: "Logs" };

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { rows } = await loadEventsFeed(parseRange(await searchParams));
  return (
    <>
      <RangeBar />
      <Panel title={`Journal · ${rows.length} derniers`}>
        {rows.length === 0 ? (
          <Empty>Le journal se remplit dès qu’une page ou une action est trackée.</Empty>
        ) : (
          <ul className="max-h-[70vh] overflow-auto">
            {rows.map((event) => (
              <li key={event.id} className="grid grid-cols-[160px_1fr] gap-3 border-b border-line px-4 py-2 text-[13px] last:border-0">
                <time className="font-mono text-[11px] text-muted-foreground" dateTime={event.created_at}>
                  {formatWhen(event.created_at)}
                </time>
                <div>
                  <p className="font-mono">{event.name}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {event.feature || "—"} · {event.path || event.session_id.slice(0, 8)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
