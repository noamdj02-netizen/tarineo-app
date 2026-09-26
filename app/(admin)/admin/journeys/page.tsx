import { RangeBar } from "@/components/admin/range-bar";
import { Empty, Panel } from "@/components/admin/ui";
import { n } from "@/lib/admin/format";
import { loadEventsFeed } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";

export const metadata = { title: "Parcours" };

export default async function JourneysPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { rows } = await loadEventsFeed(parseRange(await searchParams), "page_viewed");
  const paths = new Map<string, number>();
  for (const event of rows) {
    if (event.path) paths.set(event.path, (paths.get(event.path) ?? 0) + 1);
  }
  const ranked = [...paths.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
  return (
    <>
      <RangeBar />
      <Panel title="Pages les plus traversées">
        {ranked.length === 0 ? (
          <Empty>Les page_viewed construisent les parcours.</Empty>
        ) : (
          <ul>
            {ranked.map(([path, count]) => (
              <li key={path} className="flex justify-between gap-3 border-b border-line px-4 py-2.5 last:border-0">
                <span className="font-mono text-[13px]">{path}</span>
                <span className="tabular-nums text-muted-foreground">{n(count)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
