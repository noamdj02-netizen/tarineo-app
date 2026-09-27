import { Building2, Flame, Layers, Snowflake, Wrench, Zap, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { AUDIENCE, type TradeId } from "@/lib/site/tarineo";

const ICONS: Record<TradeId, LucideIcon> = {
  plombier: Wrench,
  electricien: Zap,
  chauffagiste: Flame,
  climaticien: Snowflake,
  generale: Building2,
  multi: Layers,
};

/** Métiers visés : une ligne de pastilles (section claire). */
export function LandingAudience() {
  return (
    <InView className="mx-auto flex max-w-[960px] flex-wrap justify-center gap-2.5 sm:gap-3" stagger={0.04}>
      {AUDIENCE.map((a) => {
        const Icon = ICONS[a.id];
        return (
          <Reveal key={a.id}>
            <span className="card-lift inline-flex h-12 items-center gap-2.5 rounded-pill border border-black/10 bg-white pr-5 pl-2 text-[15px] font-semibold text-paper-ink shadow-soft sm:h-14 sm:text-[17px]">
              <span className="grid size-8 place-items-center rounded-full bg-brand-orange/12 sm:size-10">
                <Icon className="size-4 text-brand-orange sm:size-[18px]" aria-hidden />
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
