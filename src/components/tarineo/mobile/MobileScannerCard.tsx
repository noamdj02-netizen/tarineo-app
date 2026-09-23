"use client";

import Link from "next/link";
import {
  CameraIcon,
  ChevronRightIcon,
  ClockIcon,
  FileTextIcon,
  SparklesIcon,
} from "lucide-react";
import { ImportDocument } from "@/app/(app)/documents/ImportDocument";
import { Button } from "@/components/ui/button";
import { IllustrationScanMobile } from "./IllustrationScanMobile";

/** Carte hero mobile — composition maquette APRÈS. */
export function MobileScannerCard() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#eceef1] bg-white p-5 shadow-[0_8px_28px_rgba(15,28,40,0.07)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 top-6 size-40 rounded-full bg-[radial-gradient(circle,rgba(236,88,33,0.18)_0%,rgba(236,88,33,0)_70%)]"
      />

      <div className="relative flex gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.07em] text-primary">
            <SparklesIcon className="size-3.5 shrink-0" aria-hidden />
            Analysez vos devis en quelques secondes
          </p>
          <h2 className="mt-2 text-[22px] font-bold leading-[1.15] tracking-[-0.45px] text-[#0f1c28]">
            Scanner un document
          </h2>
          <p className="mt-2 max-w-[220px] text-[13px] leading-[1.45] text-[#6b7785]">
            Photographiez un devis ou une facture fournisseur pour détecter automatiquement les
            évolutions de prix.
          </p>
        </div>

        <div className="relative -mr-1 -mt-1 w-[108px] shrink-0 self-start min-[360px]:w-[124px]">
          <IllustrationScanMobile className="w-full" />
        </div>
      </div>

      <div className="relative mt-4 flex flex-col gap-2.5">
        <ImportDocument
          preferCamera
          trigger={
            <Button className="h-12 w-full justify-between rounded-full px-5 text-[15px] font-semibold shadow-[0_8px_20px_rgba(236,88,33,0.32)]">
              <span className="inline-flex items-center gap-2">
                <CameraIcon className="size-4" aria-hidden />
                Scanner maintenant
              </span>
              <ChevronRightIcon className="size-4 opacity-90" aria-hidden />
            </Button>
          }
        />

        <div className="grid grid-cols-2 gap-2">
          <ImportDocument
            preferCamera={false}
            trigger={
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-[#e8ebef] bg-[#fafbfc] px-3 text-[12px] font-semibold text-[#0f1c28] active:scale-[0.98] motion-reduce:active:scale-100"
              >
                <FileTextIcon className="size-3.5 text-[#8a96a3]" aria-hidden />
                <span className="truncate">Importer un fichier</span>
              </button>
            }
          />
          <Link
            href="/documents"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-[#e8ebef] bg-[#fafbfc] px-3 text-[12px] font-semibold text-[#0f1c28] active:scale-[0.98] motion-reduce:active:scale-100"
          >
            <ClockIcon className="size-3.5 text-[#8a96a3]" aria-hidden />
            Historique
          </Link>
        </div>
      </div>
    </section>
  );
}
