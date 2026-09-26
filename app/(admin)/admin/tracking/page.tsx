import { RangeBar } from "@/components/admin/range-bar";
import { Panel } from "@/components/admin/ui";
import { EVENT_NAMES } from "@/lib/analytics/catalog";
import { loadEventsFeed } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";

export const metadata = { title: "Tracking" };

export default async function TrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const { volume } = await loadEventsFeed(parseRange(await searchParams));
  const seen = new Map(volume.map((row) => [row.name, row.count]));
  return (
    <>
      <RangeBar />
      <Panel title="Catalogue d’événements">
        <ul>
          {EVENT_NAMES.map((name) => {
            const count = seen.get(name) ?? 0;
            return (
              <li key={name} className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 last:border-0">
                <span className="font-mono text-[13px]">{name}</span>
                <span className={count ? "font-mono text-[11px] text-st-focus-ink" : "font-mono text-[11px] text-muted-foreground"}>
                  {count ? `${count} reçus` : "en attente"}
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>
    </>
  );
}
