import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  titre: string;
  fil?: string;
  intro?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function LandingSubpageShell({ titre, fil, intro, children, footer }: Props) {
  return (
    <>
      <div className="border-b border-black/[0.06] bg-white pt-28 sm:pt-32">
        <div className="landing-container pb-8 sm:pb-10">
          <nav className="mb-6 text-sm text-[var(--landing-muted)]" aria-label="Fil d'Ariane">
            <Link href="/" className="transition-colors hover:text-[var(--landing-text)]">
              Accueil
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--landing-text)]">{fil ?? titre}</span>
          </nav>
          <h1 className="landing-display max-w-3xl text-[2rem] font-bold leading-[1.15] text-[var(--landing-text)] sm:text-[2.75rem]">
            {titre}
          </h1>
          {intro ? (
            <p className="landing-body mt-4 max-w-2xl text-base text-[var(--landing-muted)]">{intro}</p>
          ) : null}
        </div>
      </div>
      {children}
      {footer}
    </>
  );
}
