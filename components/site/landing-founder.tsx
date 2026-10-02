import { existsSync } from "node:fs";
import { join } from "node:path";
import { HardHat } from "lucide-react";
import Image from "next/image";
import { SectionEnter } from "@/components/motion/reveal";
import { LandingBezel } from "@/components/site/landing-bezel";
import { Separator } from "@/components/ui/separator";
import { FOUNDER } from "@/lib/site/tarineo";

export function LandingFounder() {
  const hasPhoto = existsSync(join(process.cwd(), "public", FOUNDER.photo));

  return (
    <SectionEnter className="mx-auto max-w-[920px]">
      <LandingBezel tone="demo" innerClassName="bg-[#FDFCFA]">
        <div className="grid sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
          <div
            className={`relative bg-[#E8E4DE] sm:min-h-[300px] ${hasPhoto ? "aspect-[4/3] sm:aspect-auto" : "aspect-[16/7] sm:aspect-auto"}`}
          >
            {hasPhoto ? (
              <Image
                src={FOUNDER.photo}
                alt={`${FOUNDER.name}, ${FOUNDER.role.toLowerCase()}`}
                fill
                sizes="(min-width: 640px) 240px, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-[#141414]">
                <HardHat className="size-10 text-[#FF6B1A]" strokeWidth={1.5} aria-hidden />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-5 px-6 py-8 sm:px-9 sm:py-10">
            <div>
              <p className="font-display text-[22px] font-semibold tracking-[-0.03em] sm:text-[26px]">
                {FOUNDER.name}
              </p>
              <p className="mt-1 font-serif text-[16px] italic text-[#6E6E6E]">{FOUNDER.role}</p>
            </div>
            <p className="text-[17px] leading-[1.58] text-[#3D3D3D]">{FOUNDER.text}</p>
            <Separator className="bg-[rgba(10,10,10,0.08)]" />
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-[#6E6E6E]">
              {FOUNDER.facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </LandingBezel>
    </SectionEnter>
  );
}
