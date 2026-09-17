"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MascotteAnalyse } from "@/components/tarineo/MascotteAnalyse";

const INTERVALLE_MS = 15_000;

export function SuiviAnalyseDocument({
  documentId,
  actif,
}: {
  documentId: string;
  actif: boolean;
}) {
  const router = useRouter();
  const enCours = useRef(false);

  useEffect(() => {
    if (!actif) return;

    async function verifier() {
      if (enCours.current || document.hidden) return;
      enCours.current = true;
      try {
        const res = await fetch(`/api/documents/${documentId}/statut`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { status?: string };
        if (data.status && data.status !== "PROCESSING") {
          router.refresh();
        }
      } catch {
        // ignore — prochain poll
      } finally {
        enCours.current = false;
      }
    }

    const intervalle = setInterval(verifier, INTERVALLE_MS);
    const onVisible = () => {
      if (!document.hidden) verifier();
    };
    document.addEventListener("visibilitychange", onVisible);
    verifier();

    return () => {
      clearInterval(intervalle);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [actif, documentId, router]);

  if (!actif) return null;

  return (
    <div className="mt-3 flex flex-col items-center gap-4 rounded-2xl border border-[#FFE4D6] bg-gradient-to-br from-[#FFF8F5] to-[#FFF0E8] px-5 py-6 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
      <MascotteAnalyse size="md" className="shrink-0" />
      <div className="min-w-0">
        <p className="text-base font-semibold text-[#172935]">Analyse en cours…</p>
        <p className="mt-1.5 text-sm leading-relaxed text-[#53616A]">
          Tarinéo lit votre document — cette page se met à jour automatiquement.
        </p>
      </div>
    </div>
  );
}
