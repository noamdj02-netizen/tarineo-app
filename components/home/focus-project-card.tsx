import { ArrowUpRight, Star } from "lucide-react";
import Link from "next/link";
import { Illustration } from "@/components/illustration";
import { cn } from "@/lib/utils";

export type FocusProject = {
  slug: string;
  name: string;
  next: string | null;
};

/** Le projet Focus, posé comme favori du tableau fondateur. */
export function FocusProjectCard({
  project,
  className,
}: {
  project: FocusProject | null;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "card-soft relative overflow-hidden px-4 py-4 sm:px-5 sm:py-5",
        className,
      )}
      aria-label="Projet favori"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mono-label">{"/ Projet favori ///"}</p>
          {project ? (
            <>
              <h2 className="mt-1.5 font-display text-[22px] leading-tight font-semibold tracking-tight">
                {project.name}
              </h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
                {project.next?.trim() || "Ouvre la fiche pour poser la prochaine action."}
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-1.5 font-display text-[22px] leading-tight font-semibold tracking-tight">
                Pas encore de favori
              </h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
                Un seul projet en Focus. C’est celui qui reste sur le tableau.
              </p>
            </>
          )}
        </div>
        <Illustration name="dashboard-focus" className="size-16 shrink-0 sm:size-[4.5rem]" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-pill bg-ink px-2.5 py-1 text-[11px] font-medium text-accent-ink">
          <Star className="size-3 fill-current" aria-hidden />
          Favori
        </span>
        <Link
          href={project ? `/projets/${project.slug}` : "/projets"}
          className="pressable ml-auto inline-flex min-h-10 items-center gap-1.5 rounded-pill border border-line bg-surface px-3.5 text-[13.5px] font-medium hover:bg-accent-soft"
        >
          {project ? "Continuer" : "Choisir un projet"}
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
