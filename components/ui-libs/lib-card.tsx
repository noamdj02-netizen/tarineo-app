import { CopyButton } from "@/components/kit/copy-button";
import { brandLogoUrl } from "@/lib/resources/logo";
import {
  UI_LIB_CATEGORY_LABELS,
  UI_LIB_PRICING_LABELS,
  type UiLib,
} from "@/lib/ui-libs/types";

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function initials(name: string) {
  return name
    .split(/[\s/]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function UiLibCard({ lib, compact = false }: { lib: UiLib; compact?: boolean }) {
  const domain = domainOf(lib.url);
  const logo = domain ? brandLogoUrl(domain, 64) : null;
  const free = lib.pricing === "free";

  return (
    <article className="comp mb-0">
      <div className="comp-h">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="grid size-10 flex-none place-items-center overflow-hidden rounded-lg border border-line bg-surface-2"
            aria-hidden
          >
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- favicon distant, pas un logo packagé
              <img src={logo} alt="" width={20} height={20} className="size-5 object-contain" />
            ) : (
              <span className="font-mono text-[11px] font-semibold">{initials(lib.name)}</span>
            )}
          </span>
          <div className="min-w-0">
            <h3 className="truncate">{lib.name}</h3>
            <p>{lib.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={lib.url}
            target="_blank"
            rel="noopener noreferrer"
            className="copy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Visiter
            <span className="sr-only"> {lib.name} (nouvel onglet)</span>
          </a>
          <CopyButton text={lib.starterPrompt} title={`Copier le prompt ${lib.name}`}>
            Copier le prompt
          </CopyButton>
        </div>
      </div>
      {compact ? null : (
        <div className="flex flex-col gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="badge b-pause">{UI_LIB_CATEGORY_LABELS[lib.category]}</span>
            <span
              className={
                free
                  ? "badge bg-st-focus-soft text-st-focus-ink"
                  : "badge bg-st-pause-soft text-st-pause-ink"
              }
            >
              {UI_LIB_PRICING_LABELS[lib.pricing]}
            </span>
            <span className="badge b-pause">{lib.license}</span>
          </div>
          <p className="chipsx m-0">
            {lib.stack.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </p>
        </div>
      )}
    </article>
  );
}
