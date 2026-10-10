import type { ReactNode } from "react";

/** Carte bento — structure AlignUI/demo, tokens Tarineo. */
export function FeatureCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col rounded-3xl border border-line bg-paper-50">
      <div className="relative h-[18.75rem] w-full overflow-hidden rounded-3xl bg-paper-0">
        {children}
      </div>
      <div className="flex grow flex-col gap-1 p-5">
        <h3 className="line-clamp-1 text-base font-bold tracking-tight text-ink-900 md:text-lg lg:text-xl">
          {title}
        </h3>
        <p className="line-clamp-2 text-xs text-ink-500 lg:text-sm">{description}</p>
      </div>
    </div>
  );
}
