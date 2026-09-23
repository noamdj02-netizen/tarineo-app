"use client";

import Image from "next/image";
import Link from "next/link";
import { FileUpIcon, ScanLineIcon } from "lucide-react";
import { ImportDocument } from "@/app/(app)/documents/ImportDocument";
import { Button } from "@/components/ui/button";

/** Carte hero mobile : scanner un document (CTA principal Accueil). */
export function MobileScannerCard() {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#eceef1] bg-white p-5 shadow-[0_8px_24px_rgba(15,28,40,0.06)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-[#FFF0E8] opacity-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 right-8 size-28 rounded-full bg-[#FFF7F2] opacity-90"
      />

      <div className="relative flex gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
            Analysez vos devis en quelques secondes
          </p>
          <h2 className="mt-2 text-[22px] font-bold leading-tight tracking-[-0.4px] text-[#0f1c28]">
            Scanner un document
          </h2>
          <p className="mt-2 text-[13px] leading-[1.45] text-[#6b7785]">
            Photographiez un devis ou une facture fournisseur pour détecter automatiquement les
            évolutions de prix.
          </p>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
            <ImportDocument
              preferCamera
              trigger={
                <Button className="h-12 w-full gap-2 rounded-full px-5 text-[15px] font-semibold shadow-[0_6px_16px_rgba(236,88,33,0.28)] sm:w-auto">
                  <ScanLineIcon className="size-4" aria-hidden />
                  Scanner maintenant
                </Button>
              }
            />
            <div className="flex items-center gap-3 px-0.5">
              <ImportDocument
                preferCamera={false}
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0f1c28] underline-offset-2 hover:underline"
                  >
                    <FileUpIcon className="size-3.5 text-[#8a96a3]" aria-hidden />
                    Importer un fichier
                  </button>
                }
              />
              <span className="text-[#d0d5db]" aria-hidden>
                ·
              </span>
              <Link
                href="/documents"
                className="text-[13px] font-semibold text-[#0f1c28] underline-offset-2 hover:underline"
              >
                Historique
              </Link>
            </div>
          </div>
        </div>

        <div className="relative hidden w-[88px] shrink-0 self-end min-[380px]:block sm:w-[112px]">
          <Image
            src="/dashboard/mascottes/loupe.png"
            alt=""
            width={112}
            height={112}
            className="size-full object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}
