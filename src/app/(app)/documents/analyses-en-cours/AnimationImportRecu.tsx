"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ShieldCheckIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { BRAND_LOGO_SRC } from "@/components/BrandLogo";
import { MascotteOnboarding } from "@/app/(app)/onboarding/MascotteOnboarding";

const DUREE_INTRO_MS = 4_800;

export function AnimationImportRecu({
  nbDocuments,
  onTermine,
}: {
  nbDocuments: number;
  onTermine: () => void;
}) {
  const reduireMouvement = useReducedMotion();

  useEffect(() => {
    const duree = reduireMouvement ? 1_200 : DUREE_INTRO_MS;
    const t = window.setTimeout(onTermine, duree);
    return () => window.clearTimeout(t);
  }, [onTermine, reduireMouvement]);

  const pluriel = nbDocuments > 1;
  const libelleCount = pluriel ? `${nbDocuments} documents reçus` : "Document reçu";

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex min-h-dvh flex-col bg-[#0a0a0a] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduireMouvement ? 0.15 : 0.35 }}
      role="status"
      aria-live="polite"
      aria-label="Import en cours d'analyse"
    >
      <div className="flex flex-1 flex-col items-center px-6 pt-10 pb-32">
        <div className="flex flex-col items-center gap-4">
          <Image src={BRAND_LOGO_SRC} alt="" width={40} height={40} className="size-10" priority />
          <div className="flex items-center gap-2" aria-hidden>
            <span className="h-1 w-10 rounded-full bg-primary" />
            <span className="h-1 w-10 rounded-full bg-primary" />
            <span className="h-1.5 w-12 rounded-full bg-primary shadow-[0_0_12px_rgba(236,88,33,0.6)]" />
          </div>
        </div>

        <motion.div
          className="mt-10 flex size-[220px] items-center justify-center rounded-full bg-[#f5ebe0]"
          initial={reduireMouvement ? false : { scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <MascotteOnboarding />
        </motion.div>

        <motion.div
          className="mt-8 flex max-w-sm flex-col items-center gap-4 text-center"
          initial={reduireMouvement ? false : { y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <Badge className="border-0 bg-[#d4f5e4] px-4 py-1.5 text-sm font-semibold text-[#0d5c36] hover:bg-[#d4f5e4]">
            ✓ {libelleCount}
          </Badge>
          <p className="text-base leading-relaxed text-white/75">
            {pluriel
              ? "Tarinéo lit chaque fichier, détecte distributeur ou client, puis range tout dans la bonne section."
              : "Tarinéo lit votre fichier, détecte le type et le range au bon endroit — fournisseur ou espace client."}
          </p>
        </motion.div>
      </div>

      <motion.div
        className="fixed inset-x-0 bottom-0 rounded-t-[28px] bg-[#e8e8ed] px-6 py-6 text-[#1a1a1a] shadow-[0_-8px_32px_rgba(0,0,0,0.35)]"
        initial={reduireMouvement ? false : { y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto flex max-w-md items-start gap-3">
          <ShieldCheckIcon className="mt-0.5 size-6 shrink-0 text-[#1f9d55]" aria-hidden />
          <p className="text-[15px] leading-snug">
            Vos résultats apparaissent dans une dizaine de secondes. Nous vous affichons la liste de vos imports juste
            après.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
