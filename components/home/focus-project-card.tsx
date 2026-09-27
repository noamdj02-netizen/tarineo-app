import { ArrowUpRight, Star } from "lucide-react";
import Link from "next/link";
import { TarineoHdMascot } from "@/components/tarineo-hd-mascot";
import { cn } from "@/lib/utils";

export type FocusProject = {
  slug: string;
  name: string;
  next: string | null;
  docsCount?: number;
  pendingCount?: number;
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
      aria-label="Chantier en cours"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mono-label">{"/ Chantier en cours ///"}</p>
          {project ? (
            <>
              <h2 className="mt-1.5 font-display text-[22px] leading-tight font-semibold tracking-tight">
                {project.name}
              </h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
                {project.next?.trim() || "Ouvrez la fiche pour ranger les pièces."}
              </p>
              {project.docsCount != null ? (
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {project.docsCount} document{project.docsCount > 1 ? "s" : ""}
                  {project.pendingCount ? ` · ${project.pendingCount} à transformer` : ""}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <h2 className="mt-1.5 font-display text-[22px] leading-tight font-semibold tracking-tight">
                Pas encore de chantier
              </h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
                Ouvrez un chantier pour y ranger devis, factures et marge.
              </p>
            </>
          )}
        </div>
        <TarineoHdMascot name="08-pouce-ordi" className="h-16 w-20 shrink-0 sm:h-[4.5rem] sm:w-24" label="" />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-pill bg-ink px-2.5 py-1 text-[11px] font-medium text-accent-ink">
          <Star className="size-3 fill-current" aria-hidden />
          En cours
        </span>
        {project ? (
          <>
            <Link
              href={`/distributeur/devis?chantier=${project.slug}`}
              className="inline-flex min-h-10 items-center rounded-pill border border-line px-3 text-[13px] hover:bg-accent-soft"
            >
              Déposer
            </Link>
            <Link
              href={`/client/devis?chantier=${project.slug}`}
              className="inline-flex min-h-10 items-center rounded-pill border border-line px-3 text-[13px] hover:bg-accent-soft"
            >
              Envoyer au client
            </Link>
          </>
        ) : null}
        <Link
          href={project ? `/chantiers/${project.slug}` : "/chantiers#nouveau"}
          className="pressable ml-auto inline-flex min-h-10 items-center gap-1.5 rounded-pill border border-line bg-surface px-3.5 text-[13.5px] font-medium hover:bg-accent-soft"
        >
          {project ? "Fiche" : "Ouvrir un chantier"}
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
