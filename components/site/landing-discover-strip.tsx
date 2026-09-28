"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Mascot } from "@/components/mascot";
import { Card, CardContent } from "@/components/ui/card";
import { DISCOVER_USE_CASES, type GlowTint } from "@/lib/site/content";
import { cn } from "@/lib/utils";

const TINT_RING: Record<GlowTint, string> = {
  "glow-1": "bg-glow-1/20 ring-glow-1/35",
  "glow-2": "bg-glow-2/25 ring-glow-2/40",
  "glow-3": "bg-glow-3/20 ring-glow-3/35",
};

/** Bandeau horizontal « Découvrir ce que TARINEO peut faire » (style Notion). */
export function LandingDiscoverStrip() {
  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-[14px] text-muted-foreground">Découvrir ce que TARINEO peut faire</p>
      <div
        className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {DISCOVER_USE_CASES.map((item) => (
          <Link key={item.label} href="/inscription?plan=pro" className="shrink-0">
            <Card
              className="h-full w-[min(100%,280px)] gap-0 rounded-[20px] border-line py-0 shadow-soft ring-1 ring-line transition-[box-shadow,transform] duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-lift sm:w-[260px]"
            >
              <CardContent className="flex flex-col gap-3 p-5">
                <div
                  className={cn(
                    "flex h-14 w-full items-end justify-start overflow-hidden rounded-[14px] px-2 pt-2 ring-1",
                    TINT_RING[item.tint],
                  )}
                >
                  <Mascot name={item.mascot} className="h-12 w-[5.5rem]" label="" />
                </div>
                <p className="flex items-center gap-1.5 text-[15px] font-medium leading-snug text-ink">
                  {item.label}
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
