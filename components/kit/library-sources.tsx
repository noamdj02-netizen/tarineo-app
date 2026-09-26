import { brandLogoUrl } from "@/lib/resources/logo";
import { CODE_LIBS, REF_LIBS, type LibrarySource } from "@/lib/kit/library-sources";
import { ShineBorder } from "@/components/ui/shine-border";
import { cn } from "@/lib/utils";

function SourceTile({ source }: { source: LibrarySource }) {
  const logo = brandLogoUrl(source.domain, 64);
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex min-h-16 items-center gap-3 overflow-hidden rounded-[16px] border border-line bg-surface px-3 py-2.5 shadow-soft transition-[transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-lift"
    >
      <ShineBorder shineColor={["#111111", "#cbbdf3", "#111111"]} duration={16} borderWidth={1} />
      <span className="grid size-9 flex-none place-items-center overflow-hidden rounded-lg bg-white shadow-soft">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- logo.dev
          <img src={logo} alt="" width={20} height={20} className="size-5 object-contain" />
        ) : (
          <span className="font-mono text-[11px] font-semibold">{source.name.charAt(0)}</span>
        )}
      </span>
      <span className="min-w-0">
        <b className="block truncate text-[13.5px] font-semibold tracking-[-0.02em]">{source.name}</b>
        <small className="block truncate text-[12px] text-muted-foreground">{source.note}</small>
      </span>
    </a>
  );
}

function SourceRow({
  label,
  sources,
}: {
  label: string;
  sources: readonly LibrarySource[];
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="mono-label">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {sources.map((s) => (
          <SourceTile key={s.url} source={s} />
        ))}
      </div>
    </div>
  );
}

export function LibrarySources({
  className,
  refs = true,
}: {
  className?: string;
  refs?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <SourceRow label="/ Librairies à copier ///" sources={CODE_LIBS} />
      {refs ? <SourceRow label="/ Références (pas de code) ///" sources={REF_LIBS} /> : null}
    </div>
  );
}
