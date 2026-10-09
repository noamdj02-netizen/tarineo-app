import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Rappel doux : wizard 3 étapes non terminé (gating assoupli). */
export function OnboardingAppBanner({ resumeStep = 0 }: { resumeStep?: number }) {
  return (
    <div
      className="mb-4 flex flex-col gap-2 rounded-card border border-brand-orange/30 bg-[#fff5ef] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      role="status"
    >
      <p className="text-[13.5px] leading-snug text-ink">
        <span className="font-medium">2 minutes pour finir l’accueil</span> — prénom et premier PDF distributeur.
      </p>
      <Link
        href={`/onboarding?step=${resumeStep}`}
        className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1 rounded-pill bg-ink px-4 text-[13px] font-medium text-accent-ink"
      >
        Continuer
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}
