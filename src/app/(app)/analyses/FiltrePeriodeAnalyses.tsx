"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { IconCalendar, IconChevron } from "@/components/tarineo/NavIcons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { PeriodeAnalyses } from "@/lib/analysesPage";

const OPTIONS: { valeur: PeriodeAnalyses; libelle: string }[] = [
  { valeur: 3, libelle: "3 mois" },
  { valeur: 6, libelle: "6 mois" },
  { valeur: 12, libelle: "12 mois" },
];

export function FiltrePeriodeAnalyses({ periode }: { periode: PeriodeAnalyses }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const libelle = OPTIONS.find((o) => o.valeur === periode)?.libelle ?? "6 mois";

  function hrefPour(mois: PeriodeAnalyses) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mois", String(mois));
    return `${pathname}?${params.toString()}`;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className="h-10 gap-2 rounded-full border-border bg-card px-4">
            <IconCalendar />
            {libelle}
            <IconChevron />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuGroup>
          {OPTIONS.map((o) => (
            <DropdownMenuItem key={o.valeur} render={<Link href={hrefPour(o.valeur)} prefetch={false} />}>
              {o.libelle}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
