import Link from "next/link";
import { ChevronRightIcon, RadioIcon } from "lucide-react";
import type { FournisseurASurveiller } from "@/lib/dashboardAccueil";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        <Card size="sm" className="rounded-[20px] border-0 shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8">
          <CardHeader className="items-center text-center">
            <CardTitle className="text-[15px] font-semibold">Tout est stable</CardTitle>
            <CardDescription>
              Aucune hausse significative détectée ce mois-ci.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="flex gap-2.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((f) => (
            <Link
              key={f.distributorNorm}
              href={`/fournisseurs/${encodeURIComponent(f.distributorNorm)}`}
              className="w-[min(48%,168px)] min-w-[148px] shrink-0 active:scale-[0.98] motion-reduce:active:scale-100"
            >
              <Card
                size="sm"
                className="h-full gap-2 rounded-[20px] border-0 py-3.5 shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8"
              >
                <CardHeader className="grid-cols-[1fr_auto] px-3.5 pb-0">
                  <MobileAvatarFournisseur
                    nom={f.distributor}
                    norm={f.distributorNorm}
                    logoUrl={f.logoUrl}
                    size="sm"
                    variant="square"
                    className="!size-10 !rounded-[12px] !border-0 !shadow-none"
                  />
                  <Badge
                    variant="destructive"
                    className="rounded-full bg-[#FEE2E2] font-bold text-[#B91C1C] hover:bg-[#FEE2E2]"
                  >
                    {formaterPct(f.pourcentageMoyen)}
                  </Badge>
                </CardHeader>
                <CardContent className="px-3.5 pt-0">
                  <div className="flex items-center justify-between gap-1">
                    <CardTitle className="truncate text-[14px] font-bold">{f.distributor}</CardTitle>
                    <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  </div>
                  <CardDescription className="mt-0.5 text-[11px] leading-snug">
                    Hausse détectée sur {f.nbReferences} référence
                    {f.nbReferences > 1 ? "s" : ""}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
