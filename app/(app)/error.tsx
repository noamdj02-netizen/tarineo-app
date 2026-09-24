"use client";

import { Illustration } from "@/components/illustration";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-[60dvh] place-items-center px-6 py-16 text-center">
      <div className="flex max-w-[40ch] flex-col items-center gap-3">
        <Illustration name="feedback-maintenance" className="size-28" />
        <p className="mono-label">{"/ Oups ///"}</p>
        <h1 className="font-display text-[clamp(26px,5vw,34px)] leading-[1.05] font-semibold tracking-tightest">
          Cette page n’a pas pu charger.
        </h1>
        <p className="text-[15px] text-muted-foreground">Vérifie ta connexion, puis réessaie.</p>
        <button
          type="button"
          onClick={reset}
          className="btn-dark mt-2 inline-flex min-h-11 items-center rounded-pill px-5 text-[14px] font-semibold"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
