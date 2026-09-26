import { RangeBar } from "@/components/admin/range-bar";
import { Panel } from "@/components/admin/ui";
import { n } from "@/lib/admin/format";
import { loadEventsFeed } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";

export const metadata = { title: "Événements" };

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { volume } = await loadEventsFeed(parseRange(await searchParams));
  return (
    <>
      <RangeBar />
      <Panel title="Volume par événement">
        <ul>
          {volume.map((row) => (
            <li key={row.name} className="flex justify-between border-b border-line px-4 py-2.5 last:border-0">
              <span className="font-mono text-[13px]">{row.name}</span>
              <span className="tabular-nums text-muted-foreground">{n(row.count)}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
