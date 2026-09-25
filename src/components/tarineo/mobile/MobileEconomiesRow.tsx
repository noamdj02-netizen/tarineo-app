import Link from "next/link";
import { ChevronRightIcon, EuroIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/tarineo/motion/AnimatedNumber";

const formaterEuros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

/** Carte secondaire économies — shadcn Card + Badge + compteur animé. */
export function MobileEconomiesRow({
  montant,
  evolutionPct,
}: {
  montant: number;
  evolutionPct: number | null;
}) {
  const positif = (evolutionPct ?? 0) >= 0;
  const pctLabel =
    evolutionPct === null
      ? null
      : `${positif ? "↑ +" : "↓ "}${Math.abs(evolutionPct).toFixed(0).replace(".", ",")} %`;

  return (
    <Link
      href="/analyses"
      className="block active:scale-[0.99] motion-reduce:active:scale-100"
      aria-label={`Économies détectées ce mois-ci : ${formaterEuros(montant)}`}
    >
      <Card
        size="sm"
        className="rounded-[20px] border-0 py-0 shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8"
      >
        <CardContent className="flex items-center gap-3 py-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <EuroIcon className="size-[18px]" aria-hidden />
          </span>
          <p className="min-w-0 flex-1 text-[12px] font-medium text-muted-foreground">
            Économies détectées ce mois-ci
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <p className="text-[16px] font-bold tracking-[-0.3px] text-foreground tabular-nums">
              <AnimatedNumber value={montant} format={formaterEuros} />
            </p>
            {pctLabel && (
              <Badge
                variant={positif ? "secondary" : "destructive"}
                className={
                  positif
                    ? "rounded-full bg-[#D1FAE5] font-bold text-[#047857] hover:bg-[#D1FAE5]"
                    : "rounded-full bg-[#FEE2E2] font-bold text-[#B91C1C] hover:bg-[#FEE2E2]"
                }
              >
                {pctLabel}
              </Badge>
            )}
            <ChevronRightIcon className="size-4 text-muted-foreground" aria-hidden />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
