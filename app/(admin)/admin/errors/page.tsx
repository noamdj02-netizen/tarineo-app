import { RangeBar } from "@/components/admin/range-bar";
import { Empty, Panel } from "@/components/admin/ui";
import { formatWhen, n } from "@/lib/admin/format";
import { loadEventsFeed } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";

export const metadata = { title: "Bugs / erreurs" };

const ERROR_NAMES = new Set([
  "copilot_error",
  "copilot_tool_failed",
  "document_transform_failed",
]);

export default async function ErrorsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { rows, volume } = await loadEventsFeed(parseRange(await searchParams));
  const errorRows = rows.filter(
    (event) => ERROR_NAMES.has(event.name) || event.name.endsWith("_error"),
  );
  const errorVolume = volume.filter((row) => ERROR_NAMES.has(row.name) || row.name.endsWith("_error"));

  return (
    <>
      <RangeBar />
      <Panel title="Volume par type" className="mb-4">
        {errorVolume.every((row) => row.count === 0) ? (
          <Empty>Aucune erreur trackée sur la période.</Empty>
        ) : (
          <ul>
            {errorVolume
              .filter((row) => row.count > 0)
              .sort((a, b) => b.count - a.count)
              .map((row) => (
                <li
                  key={row.name}
                  className="flex justify-between border-b border-line px-4 py-2.5 last:border-0"
                >
                  <span className="font-mono text-[12.5px]">{row.name}</span>
                  <span className="tabular-nums text-muted-foreground">{n(row.count)}</span>
                </li>
              ))}
          </ul>
        )}
      </Panel>
      <Panel title={`Erreurs · ${errorRows.length}`}>
        {errorRows.length === 0 ? (
          <Empty>Aucune erreur IA / document trackée sur la période.</Empty>
        ) : (
          <ul>
            {errorRows.map((event) => (
              <li key={event.id} className="border-b border-line px-4 py-2.5 last:border-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-mono text-[12px] text-tarineo-orange">{event.name}</p>
                  <p className="text-[13px] text-muted-foreground">{formatWhen(event.created_at)}</p>
                </div>
                <p className="mt-0.5 font-mono text-[12px] text-muted-foreground">
                  {event.path || event.session_id}
                  {event.feature ? ` · ${event.feature}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
