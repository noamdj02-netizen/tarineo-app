import Link from "next/link";
import { ChevronRightIcon, RadioIcon } from "lucide-react";
import type { FournisseurASurveiller } from "@/lib/dashboardAccueil";
import { MobileAvatarFournisseur } from "./MobileAvatarFournisseur";
import { MobileSectionHeader } from "./MobileSectionHeader";

function formaterPct(n: number) {
  const signe = n > 0 ? "+" : "";
  return `${signe}${n.toFixed(0).replace(".", ",")}%`;
}

export function MobileASurveiller({ items }: { items: FournisseurASurveiller[] }) {
  return (
    <section className="flex flex-col gap-3">
      <MobileSectionHeader
        title="À surveiller"
        href="/documents?hausse=1"
        icon={<RadioIcon className="size-4" aria-hidden />}
      />

      {items.length === 0 ? (
        <div className="rounded-[20px] border border-[#eceef1] bg-white px-4 py-5 text-center shadow-[0_4px_14px_rgba(15,28,40,0.04)]">
          <p className="text-[15px] font-semibold text-[#0f1c28]">Tout est stable</p>
          <p className="mt-1 text-[13px] text-[#8a96a3]">
            Aucune hausse significative détectée ce mois-ci.
          </p>
        </div>
      ) : (
        <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((f) => (
            <Link
              key={f.distributorNorm}
              href={`/fournisseurs/${encodeURIComponent(f.distributorNorm)}`}
              className="flex w-[min(48%,168px)] min-w-[148px] shrink-0 flex-col gap-2.5 rounded-[20px] border border-[#eceef1] bg-white p-3.5 shadow-[0_4px_14px_rgba(15,28,40,0.04)] active:scale-[0.98] motion-reduce:active:scale-100"
            >
              <div className="flex items-start justify-between gap-2">
                <MobileAvatarFournisseur
                  nom={f.distributor}
                  norm={f.distributorNorm}
                  logoUrl={f.logoUrl}
                  size="sm"
                  variant="square"
                  className="!size-10 !rounded-[12px] !border-0 !shadow-none"
                />
                <span className="inline-flex items-center rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[11px] font-bold text-[#B91C1C]">
                  {formaterPct(f.pourcentageMoyen)}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-[14px] font-bold text-[#0f1c28]">{f.distributor}</p>
                  <ChevronRightIcon className="size-3.5 shrink-0 text-[#c5ccd4]" aria-hidden />
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-[#8a96a3]">
                  Hausse détectée sur {f.nbReferences} référence
                  {f.nbReferences > 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
