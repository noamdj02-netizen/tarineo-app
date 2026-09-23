"use client";

import Link from "next/link";
import { ArrowDownRightIcon, ArrowUpLeftIcon, CreditCardIcon } from "lucide-react";
import { ImportDocument } from "@/app/(app)/documents/ImportDocument";
import { MOBILE_GRADIENT_HERO } from "./mobileTokens";

const formaterEuros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

function PiluleLien({
  label,
  href,
  icone,
  className,
}: {
  label?: string;
  href: string;
  icone: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 active:scale-[0.98] transition-transform ${className ?? ""}`}
    >
      <span className="flex size-[42px] shrink-0 items-center justify-center rounded-full bg-black text-white">
        {icone}
      </span>
      {label && <span className="whitespace-nowrap text-[14px] font-medium text-[#171717]">{label}</span>}
    </Link>
  );
}

export function MobileEconomiesCard({ montant }: { montant: number }) {
  return (
    <section
      className="flex flex-col gap-8 rounded-[30px] px-4 py-6 shadow-[0_10px_28px_-4px_rgba(138,27,11,0.35)]"
      style={{ backgroundImage: MOBILE_GRADIENT_HERO }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <p className="text-base text-white">Économies totales</p>
          <span
            className="flex size-[22px] shrink-0 items-center justify-center rounded-full border border-white/50 text-[11px] font-bold text-white"
            aria-hidden
          >
            $
          </span>
        </div>
        <p className="text-[34px] font-semibold leading-none tracking-[-0.5px] text-white drop-shadow-sm">
          {formaterEuros(montant)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <ImportDocument
          trigger={
            <button
              type="button"
              className="flex min-w-0 flex-[1.15] items-center justify-between gap-1 rounded-full bg-white py-1.5 pl-1.5 pr-2.5 active:scale-[0.98] transition-transform"
            >
              <span className="flex size-[42px] shrink-0 items-center justify-center rounded-full bg-black text-white">
                <ArrowUpLeftIcon className="size-[17px]" strokeWidth={2.2} />
              </span>
              <span className="whitespace-nowrap text-[14px] font-medium text-[#171717]">Scanner</span>
            </button>
          }
        />
        <PiluleLien
          label="Historique"
          href="/documents"
          icone={<ArrowDownRightIcon className="size-[17px]" strokeWidth={2.2} />}
          className="min-w-0 flex-1"
        />
        <PiluleLien
          href="/analyses"
          icone={<CreditCardIcon className="size-[17px]" strokeWidth={2.2} />}
          className="shrink-0 pr-1.5"
        />
      </div>
    </section>
  );
}
