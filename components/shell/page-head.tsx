import { Illustration } from "@/components/illustration";
import type { IllustrationName } from "@/lib/illustrations";

/**
 * En-tête d'onglet Mono Lead : label « / LABEL /// », titre en deux tons (noir + gris), chapeau.
 * Sans Reveal : la transition de route (template) suffit pour les captures / la navigation.
 */
export function PageHead({
  label,
  title,
  tail,
  art,
  children,
}: {
  label: string;
  title: string;
  /** suite du titre, en gris */
  tail?: string;
  art?: IllustrationName;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-6">
      <div className="flex min-w-0 flex-col gap-3">
        <p className="mono-label">{`/ ${label} ///`}</p>
        <h1 className="font-display text-[clamp(30px,6vw,44px)] leading-[1.02] font-semibold tracking-tightest text-balance">
          {title}
          {tail ? <span className="text-accent-2"> {tail}</span> : null}
        </h1>
        {children ? (
          <p className="max-w-[62ch] text-[15.5px] leading-relaxed text-muted-foreground">{children}</p>
        ) : null}
      </div>
      {art ? (
        <Illustration
          name={art}
          className="-my-3 hidden size-24 opacity-90 sm:block sm:size-28 lg:size-32"
          depth={6}
        />
      ) : null}
    </div>
  );
}
