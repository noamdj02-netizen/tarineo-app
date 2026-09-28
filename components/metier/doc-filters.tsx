import { filterPillClass } from "@/components/app-ui/filter-pills";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function DocFilters({
  base,
  extra,
  chantiers,
  parties,
  chantier,
  party,
}: {
  base: string;
  extra?: string;
  chantiers: { id: string; slug: string; name: string }[];
  parties?: { id: string; name: string }[];
  chantier?: string | null;
  party?: string | null;
}) {
  function href(next: { chantier?: string | null; party?: string | null }) {
    const p = new URLSearchParams(extra);
    const c = next.chantier === undefined ? chantier : next.chantier;
    const pa = next.party === undefined ? party : next.party;
    if (c) p.set("chantier", c);
    else p.delete("chantier");
    if (pa) p.set("party", pa);
    else p.delete("party");
    const q = p.toString();
    return q ? `${base}?${q}` : base;
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="scroll-x">
        <Link href={href({ chantier: null })} className={cn(filterPillClass(!chantier), "max-md:min-h-11 shrink-0")}>
          Tous chantiers
        </Link>
        {chantiers.map((c) => (
          <Link
            key={c.id}
            href={href({ chantier: c.slug })}
            className={cn(filterPillClass(chantier === c.slug), "max-md:min-h-11 shrink-0")}
          >
            {c.name}
          </Link>
        ))}
      </div>
      {parties?.length ? (
        <div className="scroll-x">
          <Link href={href({ party: null })} className={cn(filterPillClass(!party), "max-md:min-h-11 shrink-0")}>
            Toutes enseignes
          </Link>
          {parties.map((p) => (
            <Link
              key={p.id}
              href={href({ party: p.id })}
              className={cn(filterPillClass(party === p.id), "max-md:min-h-11 shrink-0")}
            >
              {p.name}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
