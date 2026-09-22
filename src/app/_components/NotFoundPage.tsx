import Image from "next/image";
import Link from "next/link";

type Props = {
  homeHref?: string;
  homeLabel?: string;
};

export function NotFoundPage({
  homeHref = "/",
  homeLabel = "Retour à l'accueil",
}: Props) {
  return (
    <div className="landing-theme landing-body flex min-h-screen flex-col items-center justify-center bg-white px-6 py-16 text-center">
      <Image
        src="/landing/404-mascot.png"
        alt="Page introuvable — mascotte Tarineo avec panneau 404"
        width={310}
        height={329}
        priority
        className="mb-4 h-auto w-[min(310px,72vw)] object-contain"
      />

      <h1 className="landing-display mb-3 text-[2rem] font-semibold leading-tight text-[var(--landing-text)] sm:text-5xl">
        Oups !
      </h1>

      <p className="landing-body mb-10 max-w-lg text-lg font-light leading-snug text-[var(--landing-text)] sm:text-2xl">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>

      <Link
        href={homeHref}
        className="landing-body inline-flex min-h-14 min-w-[220px] items-center justify-center rounded-[5px] bg-white px-6 text-sm font-medium tracking-[0.2em] text-black uppercase shadow-[0_4px_12px_rgba(0,0,0,0.31)] transition-opacity hover:opacity-90"
      >
        {homeLabel}
      </Link>
    </div>
  );
}
