"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
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
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">Erreur</p>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Un problème est survenu</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Tarinéo a rencontré une erreur inattendue. Réessayez ou revenez à l&apos;accueil.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-11 items-center rounded-full border border-border bg-card px-6 text-sm font-semibold"
        >
          Réessayer
        </button>
        <Link
          href="/accueil"
          className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
        >
          Retour à l&apos;accueil
        </Link>
        <a href="mailto:contact@tarineo.com" className="text-sm font-medium text-primary hover:underline">
          Contacter le support
        </a>
      </div>
    </main>
  );
}
