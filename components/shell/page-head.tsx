import { Illustration } from "@/components/illustration";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import type { IllustrationName } from "@/lib/illustrations";

/**
 * En-tête d'onglet Mono Lead : label « / LABEL /// », titre en deux tons (noir + gris), chapeau.
 * `art` : petite illustration à droite, masquée sur mobile pour garder la place au contenu.
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
      <RevealGroup className="flex min-w-0 flex-col gap-3">
        <Reveal>
          <p className="mono-label">{`/ ${label} ///`}</p>
        </Reveal>
        <Reveal>
          <h1 className="font-display text-[clamp(30px,6vw,44px)] leading-[1.02] font-semibold tracking-tightest text-balance">
            {title}
            {tail ? <span className="text-accent-2"> {tail}</span> : null}
          </h1>
        </Reveal>
        {children ? (
          <Reveal>
            <p className="max-w-[62ch] text-[15.5px] leading-relaxed text-muted">{children}</p>
          </Reveal>
        ) : null}
      </RevealGroup>
      {art ? <Illustration name={art} className="-my-3 hidden size-28 sm:block lg:size-32" /> : null}
    </div>
  );
}
