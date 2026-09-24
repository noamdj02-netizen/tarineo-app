"use client";

import type { PreLandingTemplate } from "@/lib/prelanding/templates";
import { PreviewFrame } from "./preview-frame";

const ghost =
  "inline-flex min-h-9 items-center rounded-pill border border-line bg-surface px-3.5 text-[13px] font-medium hover:bg-accent-soft";
const dark = "btn-dark inline-flex min-h-9 items-center rounded-pill px-3.5 text-[13px] font-semibold";

/**
 * Carte de la bibliothèque. Avec une souris, les actions apparaissent sur l'aperçu au survol ;
 * sur écran tactile (pas de survol), elles restent visibles sous la carte.
 */
export function PreLandingCard({
  template,
  preview,
  onPreview,
  onUse,
}: {
  template: PreLandingTemplate;
  preview: React.ReactNode;
  onPreview: () => void;
  onUse: () => void;
}) {
  return (
    <article className="group flex min-w-0 flex-col">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-card border border-line bg-surface shadow-soft transition-[transform,box-shadow] duration-200 ease-out-soft group-hover:-translate-y-1 group-hover:shadow-lift">
        <button
          type="button"
          onClick={onPreview}
          aria-label={`Preview ${template.name}`}
          className="absolute inset-0 rounded-card outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-inset"
        >
          <div className="h-full transition-transform duration-[250ms] ease-out-soft group-hover:scale-[1.015]">
            <PreviewFrame crop>{preview}</PreviewFrame>
          </div>
        </button>
        <div className="pointer-events-none absolute right-3 bottom-3 hidden gap-1.5 opacity-0 transition-opacity duration-200 ease-out-soft group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 [@media(hover:hover)]:flex">
          <button type="button" onClick={onPreview} tabIndex={-1} className={`${ghost} shadow-soft`}>
            Preview
          </button>
          <button type="button" onClick={onUse} className={dark}>
            Use template
          </button>
        </div>
      </div>

      <div className="mt-4 px-0.5">
        <p className="mono-label">/ {template.number}</p>
        <h3 className="mt-1 text-[19px] leading-tight font-semibold tracking-[-0.03em]">{template.name}</h3>
        <p className="mt-1 text-[14px] leading-snug text-muted-foreground">{template.description}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tags">
          {template.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-pill border border-line bg-surface px-2.5 py-1 text-[12px] font-medium text-ink/70"
            >
              {tag}
            </li>
          ))}
        </ul>
        <div className="mt-3.5 flex gap-1.5 [@media(hover:hover)]:hidden">
          <button type="button" onClick={onPreview} className={ghost}>
            Preview
          </button>
          <button type="button" onClick={onUse} className={dark}>
            Use template
          </button>
        </div>
      </div>
    </article>
  );
}
