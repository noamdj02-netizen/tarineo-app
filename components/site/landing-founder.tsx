import { existsSync } from "node:fs";
import { join } from "node:path";
import { HardHat } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FOUNDER } from "@/lib/site/tarineo";

/** « Qui est derrière » : photo du fondateur (si présente dans /public) et son parcours. */
export function LandingFounder() {
  const hasPhoto = existsSync(join(process.cwd(), "public", FOUNDER.photo));

  return (
    <InView className="mx-auto max-w-[920px]">
      <Reveal>
        <Card className="grid gap-0 overflow-hidden rounded-2xl py-0 shadow-lift sm:grid-cols-[260px_minmax(0,1fr)]">
          <div className={`relative bg-muted sm:aspect-auto sm:min-h-[300px] ${hasPhoto ? "aspect-[4/3]" : "aspect-[16/7]"}`}>
            {hasPhoto ? (
              <Image
                src={FOUNDER.photo}
                alt={`${FOUNDER.name}, ${FOUNDER.role.toLowerCase()}`}
                fill
                sizes="(min-width: 640px) 260px, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(160deg,#1a1410_0%,#0c0c0c_100%)]">
                <span className="grid size-24 place-items-center rounded-full border border-brand-orange/40 bg-brand-orange/12">
                  <HardHat className="size-10 text-brand-orange-light" aria-hidden />
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-4 px-5 py-6 sm:px-8 sm:py-8">
            <div>
              <p className="font-display text-[22px] font-semibold sm:text-[26px]">{FOUNDER.name}</p>
              <p className="text-[15px] text-muted-foreground sm:text-base">{FOUNDER.role}</p>
            </div>
            <p className="text-[16px] leading-relaxed sm:text-[18px]">{FOUNDER.text}</p>
            <ul className="flex flex-wrap gap-2">
              {FOUNDER.facts.map((f) => (
                <li key={f}>
                  <Badge variant="outline" className="h-7 rounded-md px-2.5 text-[13px] font-medium">
                    {f}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </Reveal>
    </InView>
  );
}
