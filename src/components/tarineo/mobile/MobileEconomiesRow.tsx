import Link from "next/link";
import { ChevronRightIcon, EuroIcon } from "lucide-react";

const formaterEuros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

/** Carte secondaire économies — ne doit plus dominer l'Accueil mobile. */
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
      : `${evolutionPct > 0 ? "+" : ""}${evolutionPct.toFixed(0).replace(".", ",")} %`;

  return (
    <Link
      href="/analyses"
      className="flex items-center gap-3 rounded-[18px] border border-[#eceef1] bg-white py-3.5 pl-3.5 pr-3 shadow-[0_4px_12px_rgba(0,0,0,0.04)] active:scale-[0.99] motion-reduce:active:scale-100"
      aria-label={`Économies détectées ce mois-ci : ${formaterEuros(montant)}`}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#FFF0E8] text-primary">
        <EuroIcon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-[#8a96a3]">Économies détectées ce mois-ci</p>
        <div className="mt-0.5 flex items-baseline gap-2">
          <p className="text-[18px] font-bold tracking-[-0.3px] text-[#0f1c28]">
            {formaterEuros(montant)}
          </p>
          {pctLabel && (
            <span
              className={`text-[12px] font-semibold ${
                (evolutionPct ?? 0) >= 0 ? "text-[#1F9D55]" : "text-[#ec5821]"
              }`}
            >
              {pctLabel}
            </span>
          )}
        </div>
      </div>
      <ChevronRightIcon className="size-4 shrink-0 text-[#c5ccd4]" aria-hidden />
    </Link>
  );
}
