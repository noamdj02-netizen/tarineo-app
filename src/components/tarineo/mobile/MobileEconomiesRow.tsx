import Link from "next/link";
import { ChevronRightIcon, EuroIcon } from "lucide-react";

const formaterEuros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

/** Carte secondaire économies — composition maquette APRÈS. */
export function MobileEconomiesRow({
  montant,
  evolutionPct,
}: {
  montant: number;
  evolutionPct: number | null;
}) {
  const pctLabel =
    evolutionPct === null
      ? null
      : `${evolutionPct > 0 ? "↑ +" : "↓ "}${Math.abs(evolutionPct).toFixed(0).replace(".", ",")} %`;

  return (
    <Link
      href="/analyses"
      className="flex items-center gap-3 rounded-[20px] border border-[#eceef1] bg-white py-3.5 pl-3.5 pr-3 shadow-[0_4px_14px_rgba(15,28,40,0.04)] active:scale-[0.99] motion-reduce:active:scale-100"
      aria-label={`Économies détectées ce mois-ci : ${formaterEuros(montant)}`}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0E8] text-primary">
        <EuroIcon className="size-[18px]" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-[#8a96a3]">Économies détectées ce mois-ci</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <p className="text-[16px] font-bold tracking-[-0.3px] text-[#0f1c28]">{formaterEuros(montant)}</p>
        {pctLabel && (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
              (evolutionPct ?? 0) >= 0
                ? "bg-[#D1FAE5] text-[#047857]"
                : "bg-[#FEE2E2] text-[#B91C1C]"
            }`}
          >
            {pctLabel}
          </span>
        )}
        <ChevronRightIcon className="size-4 text-[#c5ccd4]" aria-hidden />
      </div>
    </Link>
  );
}
