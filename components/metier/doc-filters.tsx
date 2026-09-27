import Link from "next/link";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-wrap gap-2">
        <Link href={href({ chantier: null })} className={cn("rounded-full px-3 py-1.5 text-[13px]", !chantier ? "bg-ink text-accent-ink" : "border border-line")}>
          Tous chantiers
        </Link>
        {chantiers.map((c) => (
          <Link
            key={c.id}
            href={href({ chantier: c.slug })}
            className={cn("rounded-full px-3 py-1.5 text-[13px]", chantier === c.slug ? "bg-ink text-accent-ink" : "border border-line")}
          >
            {c.name}
          </Link>
        ))}
      </div>
      {parties?.length ? (
        <div className="flex flex-wrap gap-2">
          <Link href={href({ party: null })} className={cn("rounded-full px-3 py-1.5 text-[13px]", !party ? "bg-ink text-accent-ink" : "border border-line")}>
            Toutes enseignes
          </Link>
          {parties.map((p) => (
            <Link
              key={p.id}
              href={href({ party: p.id })}
              className={cn("rounded-full px-3 py-1.5 text-[13px]", party === p.id ? "bg-ink text-accent-ink" : "border border-line")}
            >
              {p.name}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
