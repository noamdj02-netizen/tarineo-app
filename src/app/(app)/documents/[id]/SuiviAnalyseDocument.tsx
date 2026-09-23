"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MascotteAnalyse } from "@/components/tarineo/MascotteAnalyse";
import { declencherAnalyseDocument } from "@/lib/declencherAnalyseDocument";
import { BoutonRelancerAnalyse } from "./BoutonRelancerAnalyse";

const INTERVALLE_MS = 3_000;
const TIMEOUT_MS = 300_000;

export function SuiviAnalyseDocument({
  documentId,
  actif,
}: {
  documentId: string;
  actif: boolean;
}) {
  const router = useRouter();
  const enCours = useRef(false);
  const analyseDeclenchee = useRef(false);
  const debutRef = useRef(0);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!actif) return;

    debutRef.current = Date.now();
    analyseDeclenchee.current = false;
    const resetExpired = window.setTimeout(() => setExpired(false), 0);

    async function verifier() {
      if (enCours.current || document.hidden) return;
      if (Date.now() - debutRef.current > TIMEOUT_MS) {
        setExpired(true);
        return;
      }

      enCours.current = true;
      try {
        const res = await fetch(`/api/documents/${documentId}/statut`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { status?: string };

        if (data.status === "PROCESSING" && !analyseDeclenchee.current) {
          analyseDeclenchee.current = true;
          void declencherAnalyseDocument(documentId);
        }

        if (data.status && data.status !== "PROCESSING") {
          router.refresh();
        }
      } catch {
        /* prochain poll */
      } finally {
        enCours.current = false;
      }
    }

    const intervalle = setInterval(verifier, INTERVALLE_MS);
    const onVisible = () => {
      if (!document.hidden) verifier();
    };
    document.addEventListener("visibilitychange", onVisible);
    void verifier();

    return () => {
      window.clearTimeout(resetExpired);
      clearInterval(intervalle);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [actif, documentId, router]);

  if (!actif) return null;

  if (expired) {
    return (
      <div className="mt-3 flex flex-col items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-6 text-center">
        <p className="text-base font-semibold text-[#172935]">Analyse plus longue que prévu</p>
        <p className="text-sm leading-relaxed text-[#53616A]">
          Le document est enregistré. Relancez l&apos;analyse ou revenez dans quelques instants.
        </p>
        <BoutonRelancerAnalyse documentId={documentId} />
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col items-center gap-4 rounded-2xl border border-[#FFE4D6] bg-gradient-to-br from-[#FFF8F5] to-[#FFF0E8] px-5 py-6 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
      <MascotteAnalyse size="md" className="mx-auto shrink-0 sm:mx-0" />
      <div className="min-w-0 text-center sm:text-left">
        <p className="text-base font-semibold text-[#172935]">Analyse en cours…</p>
        <p className="mt-1.5 text-sm leading-relaxed text-[#53616A]">
          Tarinéo lit votre document — cette page se met à jour automatiquement.
        </p>
      </div>
    </div>
  );
}
