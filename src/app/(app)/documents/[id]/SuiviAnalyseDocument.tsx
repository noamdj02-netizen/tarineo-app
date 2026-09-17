"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SuiviAnalyseDocument({ actif }: { actif: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!actif) return;

    const intervalle = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(intervalle);
  }, [actif, router]);

  if (!actif) return null;

  return (
    <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
      <p className="font-medium">Analyse en cours…</p>
      <p className="mt-1">L&apos;IA lit votre document — cette page se met à jour automatiquement.</p>
    </div>
  );
}
