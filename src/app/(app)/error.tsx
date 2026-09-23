"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-5 py-16 text-center">
      <h1 className="text-xl font-bold text-foreground">Impossible d&apos;afficher cette page</h1>
      <p className="text-sm text-muted-foreground">
        Une erreur s&apos;est produite. Vous pouvez réessayer ou revenir au tableau de bord.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-10 items-center rounded-full border border-border px-5 text-sm font-medium"
        >
          Réessayer
        </button>
        <Link href="/accueil" className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
          Retour à l&apos;accueil
        </Link>
      </div>
      <a href="mailto:contact@tarineo.com" className="text-sm text-primary hover:underline">
        Signaler le problème au support
      </a>
    </div>
  );
}
