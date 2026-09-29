import { Building2, Flame, Layers, Snowflake, Wrench, Zap, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { AUDIENCE, type TradeId } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

const ICONS: Record<TradeId, LucideIcon> = {
  plombier: Wrench,
  electricien: Zap,
  chauffagiste: Flame,
  climaticien: Snowflake,
  generale: Building2,
  multi: Layers,
};

/** Métiers réellement ciblés — pastilles sobres, identité produit. */
export function LandingAudience() {
  return (
    <InView
      className="mx-auto flex max-w-[960px] flex-wrap justify-center gap-2.5 sm:gap-3"
      stagger={0.04}
    >
      {AUDIENCE.map((a) => {
        const Icon = ICONS[a.id];
        return (
          <Reveal key={a.id}>
            <span
              className={cn(
                "inline-flex min-h-11 items-center gap-2.5 rounded-[14px] border border-[rgba(10,10,10,0.08)]",
                "bg-[#FFFFFF] pr-4 pl-2 text-[14px] font-semibold tracking-[-0.01em] text-[#0A0A0A] sm:text-[15px]",
              )}
            >
              <span className="grid size-8 place-items-center rounded-[10px] bg-[rgba(255,107,26,0.12)]">
                <Icon className="size-4 text-[#FF6B1A]" aria-hidden />
              </span>
              {a.title}
              <span className="sr-only">. {a.text}</span>
            </span>
          </Reveal>
        );
      })}
    </InView>
  );
}
