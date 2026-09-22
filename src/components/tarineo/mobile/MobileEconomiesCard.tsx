"use client";

import Link from "next/link";
import { ClockIcon, ScanLineIcon, WalletIcon } from "lucide-react";
import { ImportDocument } from "@/app/(app)/documents/ImportDocument";
import { Button } from "@/components/ui/button";

const formaterEuros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export function MobileEconomiesCard({ montant }: { montant: number }) {
  return (
    <section
      className="rounded-3xl px-[22px] pb-5 pt-6 shadow-[0_10px_24px_-2px_rgba(140,64,26,0.3)]"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgb(28, 17, 12) 0%, rgb(107, 48, 22) 40%, rgb(196, 80, 32) 75%, rgb(236, 88, 33) 100%)",
      }}
    >
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-white/70">Économies totales</p>
        <span
          className="flex size-[18px] items-center justify-center rounded-[9px] bg-white/15 text-[11px] font-bold text-white/80"
          title="Montant identifié grâce aux comparaisons de prix ce mois-ci"
        >
          i
        </span>
      </div>
      <p className="mt-2 text-[42px] font-bold tracking-[-1.2px] text-white">{formaterEuros(montant)}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ImportDocument
          trigger={
            <Button
              variant="secondary"
              className="h-auto gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#0f1c28] shadow-none hover:bg-white/95"
            >
              <ScanLineIcon className="size-3.5" />
              Scanner
            </Button>
          }
        />
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#0f1c28]"
        >
          <ClockIcon className="size-3.5" />
          Historique
        </Link>
        <Link
          href="/analyses"
          className="inline-flex size-[42px] items-center justify-center rounded-[21px] bg-white text-[#0f1c28]"
          aria-label="Analyses"
        >
          <WalletIcon className="size-4" />
        </Link>
      </div>
    </section>
  );
}
