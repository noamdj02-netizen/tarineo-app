import { Reveal, RevealGroup } from "@/components/motion/reveal";

/**
 * En-tête d'onglet Mono Lead : label « / LABEL /// », titre en deux tons (noir + gris), chapeau.
 */
export function PageHead({
  label,
  title,
  tail,
  children,
}: {
  label: string;
  title: string;
  /** suite du titre, en gris */
  tail?: string;
  children?: React.ReactNode;
}) {
  return (
    <RevealGroup className="mb-6 flex flex-col gap-3">
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
  );
}

/** Espace réservé pour les onglets pas encore migrés. */
export function Soon({ step }: { step: number }) {
  return (
    <div className="card-soft p-5">
      <p className="mono-label">/ Bientôt</p>
      <p className="mt-2 text-sm text-muted">Contenu migré à l’étape {step}.</p>
    </div>
  );
}
