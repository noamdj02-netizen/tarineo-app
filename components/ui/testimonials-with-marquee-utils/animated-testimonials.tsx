"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MarqueeTestimonial = {
  name: string;
  handle: string;
  description: string;
  image: string;
};

function MarqueeCard({ item }: { item: MarqueeTestimonial }) {
  return (
    <Card className="h-full w-[min(88vw,320px)] shrink-0 gap-0 rounded-[22px] border-line py-0 shadow-soft ring-1 ring-line sm:w-[320px]">
      <CardContent className="flex h-full flex-col gap-4 px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="relative size-11 overflow-hidden rounded-full bg-surface-2 ring-1 ring-line">
            <Image src={item.image} alt="" fill sizes="44px" className="object-cover" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-tight text-foreground">{item.name}</p>
            <p className="truncate text-[13px] text-muted-foreground">{item.handle}</p>
          </div>
        </div>
        <p className="flex-1 text-[14.5px] leading-relaxed text-pretty text-foreground/90">{item.description}</p>
      </CardContent>
    </Card>
  );
}

function Lane({
  data,
  reverse = false,
  duration = 56,
}: {
  data: MarqueeTestimonial[];
  reverse?: boolean;
  duration?: number;
}) {
  const lane = [...data, ...data];
  return (
    <div
      className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
      aria-hidden
    >
      <div
        className={cn(
          "flex w-max gap-4 px-4 will-change-transform motion-reduce:animate-none",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
        )}
        style={{ "--marquee-duration": `${duration}s`, "--gap": "1rem" } as CSSProperties}
      >
        {lane.map((item, i) => (
          <MarqueeCard key={`${item.name}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

/** Deux bandes qui défilent en sens inverse. */
export function AnimatedTestimonials({ data }: { data: MarqueeTestimonial[] }) {
  const mid = Math.ceil(data.length / 2);
  const top = data.slice(0, mid);
  const bottom = data.slice(mid);
  return (
    <div className="flex w-full flex-col gap-4 py-2" aria-label="Avis fondateurs">
      <Lane data={top} duration={64} />
      <Lane data={bottom.length ? bottom : top} reverse duration={72} />
    </div>
  );
}
