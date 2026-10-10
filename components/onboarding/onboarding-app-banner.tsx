import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Rappel doux : wizard 3 étapes non terminé (gating assoupli). */
export function OnboardingAppBanner({ resumeStep = 0 }: { resumeStep?: number }) {
  return (
    <div
      className="mb-4 flex flex-col gap-3 rounded-[22px] border border-tarineo-orange/25 bg-wash-orange/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
      role="status"
    >
      <div className="min-w-0">
        <p className="font-display text-[15px] font-semibold tracking-tight text-ink">
          2 minutes pour finir l’accueil
        </p>
        <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
          Prénom, puis un premier PDF distributeur.
        </p>
      </div>
      <Link
        href={`/onboarding?step=${resumeStep}`}
        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-pill bg-tarineo-orange px-4 text-[13px] font-medium text-white transition-[filter] hover:brightness-[0.96]"
      >
        Continuer
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}
