import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import type { FournisseurASurveiller } from "@/lib/dashboardAccueil";
import { MobileAvatarFournisseur } from "./MobileAvatarFournisseur";
import { MobileSectionHeader } from "./MobileSectionHeader";

function formaterPct(n: number) {
  const signe = n > 0 ? "+" : "";
  return `${signe}${n.toFixed(0).replace(".", ",")} %`;
}

export function MobileASurveiller({ items }: { items: FournisseurASurveiller[] }) {
  return (
    <section className="flex flex-col gap-3">
      <MobileSectionHeader title="À surveiller" href="/documents?hausse=1" />

      {items.length === 0 ? (
        <div className="rounded-[18px] border border-[#eceef1] bg-white px-4 py-5 text-center shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <p className="text-[15px] font-semibold text-[#0f1c28]">Tout est stable</p>
          <p className="mt-1 text-[13px] text-[#8a96a3]">
            Aucune hausse significative détectée ce mois-ci.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((f) => (
            <Link
              key={f.distributorNorm}
              href={`/fournisseurs/${encodeURIComponent(f.distributorNorm)}`}
              className="flex items-center gap-3 rounded-[18px] border border-[#eceef1] bg-white py-3.5 pl-3.5 pr-3 shadow-[0_4px_12px_rgba(0,0,0,0.04)] active:scale-[0.99] motion-reduce:active:scale-100"
            >
              <MobileAvatarFournisseur
                nom={f.distributor}
                norm={f.distributorNorm}
                logoUrl={f.logoUrl}
                size="sm"
                variant="square"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[15px] font-semibold uppercase tracking-[-0.2px] text-[#0f1c28]">
                    {f.distributor}
                  </p>
                  <span className="shrink-0 text-[15px] font-bold text-[#ec5821]">
                    {formaterPct(f.pourcentageMoyen)}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] leading-snug text-[#8a96a3]">
                  Hausse détectée sur {f.nbReferences} référence
                  {f.nbReferences > 1 ? "s" : ""}
                </p>
              </div>
              <ChevronRightIcon className="size-4 shrink-0 text-[#c5ccd4]" aria-hidden />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
