"use client";

import { AnimatePresence } from "framer-motion";
import { Plus, Search, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  CATEGORIES,
  PRE_LANDING_TEMPLATES,
  SCRATCH_TEMPLATE,
  STYLES,
  findTemplate,
  type Category,
  type Style,
} from "@/lib/prelanding/templates";
import { cn } from "@/lib/utils";
import { PreLandingCard } from "./pre-landing-card";
import { PreLandingModal } from "./pre-landing-modal";
import { UseTemplateDialog, type ProjectOption } from "./use-template-dialog";

const chip = (active: boolean) =>
  cn(
    "min-h-10 flex-none rounded-pill border px-3.5 text-[13px] font-semibold transition-colors duration-200",
    active ? "border-ink bg-ink text-accent-ink" : "border-line bg-surface text-ink/80 hover:bg-accent-soft",
  );

const ROW = "-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export function PreLandingLibrary({
  header,
  previews,
  projects,
}: {
  header: React.ReactNode;
  previews: Record<string, React.ReactNode>;
  projects: ProjectOption[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [style, setStyle] = useState<Style | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [useId, setUseId] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRE_LANDING_TEMPLATES.filter((t) => {
      if (category && !t.categories.includes(category)) return false;
      if (style && !t.styles.includes(style)) return false;
      if (!q) return true;
      return [t.name, t.description, ...t.tags, ...t.categories, ...t.styles]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, category, style]);

  const reset = () => {
    setQuery("");
    setCategory(null);
    setStyle(null);
  };

  const closePreview = useCallback(() => setPreviewId(null), []);
  const closeUse = useCallback(() => setUseId(null), []);
  const previewed = previewId ? findTemplate(previewId) : undefined;
  const using = useId ? findTemplate(useId) : undefined;

  return (
    <div className="@container">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 [&>*]:mb-0">{header}</div>
        <button
          type="button"
          onClick={() => setUseId(SCRATCH_TEMPLATE.id)}
          className="btn-dark inline-flex min-h-11 flex-none items-center gap-1.5 self-start rounded-pill px-4 text-[14px] font-semibold sm:mb-1 sm:self-auto"
        >
          <Plus className="size-4" aria-hidden /> Create from scratch
        </button>
      </div>

      <div className="mt-7 flex flex-col gap-3">
        <label className="relative block">
          <span className="sr-only">Search templates</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates..."
            className="min-h-12 w-full rounded-pill border border-line bg-surface pr-4 pl-10 text-[15px] outline-none placeholder:text-muted focus:border-ink/30 focus:shadow-soft"
          />
        </label>
        <div className={ROW} role="group" aria-label="Category">
          <button type="button" aria-pressed={!category} onClick={() => setCategory(null)} className={chip(!category)}>
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(category === c ? null : c)}
              className={chip(category === c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className={ROW} role="group" aria-label="Style">
          <button type="button" aria-pressed={!style} onClick={() => setStyle(null)} className={chip(!style)}>
            All styles
          </button>
          {STYLES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={style === s}
              onClick={() => setStyle(style === s ? null : s)}
              className={chip(style === s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 mb-4 text-[13px] text-muted" aria-live="polite">
        {results.length} {results.length === 1 ? "template" : "templates"}
      </p>

      {results.length ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 @min-[560px]:grid-cols-2 @min-[940px]:grid-cols-3 @min-[940px]:gap-x-7">
          {results.map((t) => (
            <PreLandingCard
              key={t.id}
              template={t}
              preview={previews[t.id]}
              onPreview={() => setPreviewId(t.id)}
              onUse={() => setUseId(t.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid place-items-center rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center">
          <p className="text-[17px] font-semibold tracking-[-0.02em]">No template matches</p>
          <p className="mt-1 text-[14.5px] text-muted">Try another word, or clear the filters.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 inline-flex min-h-10 items-center gap-1.5 rounded-pill border border-line bg-surface-2 px-4 text-[13.5px] font-medium hover:bg-accent-soft"
          >
            <X className="size-4" aria-hidden /> Clear filters
          </button>
        </div>
      )}

      <AnimatePresence>
        {previewed ? (
          <PreLandingModal
            key="preview"
            template={previewed}
            preview={previews[previewed.id]}
            onClose={closePreview}
            onUse={() => {
              setPreviewId(null);
              setUseId(previewed.id);
            }}
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {using ? <UseTemplateDialog key="use" template={using} projects={projects} onClose={closeUse} /> : null}
      </AnimatePresence>
    </div>
  );
}
