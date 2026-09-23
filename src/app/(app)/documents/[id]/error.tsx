"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DocumentDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erreur page document :", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-[#172935]">Impossible d&apos;afficher ce document</h1>
      <p className="text-sm leading-relaxed text-[#53616A]">
        Un problème est survenu lors du chargement. Vos données sont enregistrées — réessayez ou revenez à la
        liste.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={reset} className="rounded-full">
          Réessayer
        </Button>
        <Button variant="outline" className="rounded-full" render={<Link href="/documents" />} nativeButton={false}>
          Mes documents
        </Button>
      </div>
    </div>
  );
}
