import { RangeBar } from "@/components/admin/range-bar";
import { Empty, Panel } from "@/components/admin/ui";
import { formatWhen } from "@/lib/admin/format";
import { loadEventsFeed } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";

export const metadata = { title: "Bugs / erreurs" };

export default async function ErrorsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { rows } = await loadEventsFeed(parseRange(await searchParams), "copilot_error");
  return (
    <>
      <RangeBar />
      <Panel title={`Erreurs copilote · ${rows.length}`}>
        {rows.length === 0 ? (
          <Empty>Aucune erreur IA trackée sur la période.</Empty>
        ) : (
          <ul>
            {rows.map((event) => (
              <li key={event.id} className="border-b border-line px-4 py-2.5 last:border-0">
                <p className="text-[14px]">{formatWhen(event.created_at)}</p>
                <p className="font-mono text-[12px] text-muted-foreground">{event.path || event.session_id}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
