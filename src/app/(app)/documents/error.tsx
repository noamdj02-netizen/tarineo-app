"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DocumentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erreur page documents :", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-[#172935]">Impossible de charger vos documents</h1>
      <p className="text-sm leading-relaxed text-[#53616A]">
        La page n&apos;a pas pu s&apos;afficher. Vérifiez votre connexion puis réessayez.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={reset} className="rounded-full">
          Réessayer
        </Button>
        <Button variant="outline" className="rounded-full" render={<Link href="/accueil" />} nativeButton={false}>
          Accueil
        </Button>
      </div>
    </div>
  );
}
