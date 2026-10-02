"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { HeroDocumentCard } from "@/components/site/hero/hero-document-card";
import { HeroEngineCard } from "@/components/site/hero/hero-engine-card";
import { HeroFlowControls } from "@/components/site/hero/hero-scene-controls";
import {
  type HeroStep,
  reached,
  useHeroSequence,
} from "@/components/site/hero/use-hero-sequence";
import { DEMO_MARK, DEMO_NOTE } from "@/lib/site/tarineo";
import { HERO_SCENES } from "@/lib/site/product-demo";
import { cn } from "@/lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;

/** Hero landing : une seule scène démo (analyser un devis). */
const HERO_FLOW_SCENE = HERO_SCENES[0]!;

function focusIndex(step: HeroStep, reduced: boolean): 0 | 1 | 2 {
  if (reduced) return 2;
  if (reached(step, "build")) return 2;
  if (reached(step, "engine")) return 1;
  return 0;
}

function stageMotion(active: boolean, reduced: boolean) {
  return {
    opacity: active ? 1 : reduced ? 0.92 : 0.7,
    scale: active ? 1.025 : reduced ? 1 : 0.98,
  };
}

function FlowArrow({ active }: { active: boolean }) {
  return (
    <motion.span
      aria-hidden
      className="hidden shrink-0 text-tarineo-orange md:grid"
      initial={false}
      animate={{ opacity: active ? 0.8 : 0.18 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <ArrowRight className="size-3.5" strokeWidth={1.6} />
    </motion.span>
  );
}

/**
 * Devis fournisseur → analyse TARINEO → devis client.
 * Desktop : trois cartes en ligne. Mobile : défilement horizontal borné.
 */
export function HeroDocumentFlow({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.12 });
  const { step, prefersReduced, goToFlowFocus } = useHeroSequence(inView);

  const scene = HERO_FLOW_SCENE;
  const focus = focusIndex(step, prefersReduced);
  const engineOn = reached(step, "engine");
  const resultOn = reached(step, "build");

  const shiftFocus = (delta: -1 | 1) => {
    const next = Math.min(2, Math.max(0, focus + delta)) as 0 | 1 | 2;
    goToFlowFocus(next);
  };

  return (
    <div ref={ref} className={cn("flex min-w-0 flex-col", className)}>
      <figure className="m-0 min-w-0">
        <figcaption className="sr-only">
          Exemple animé — {scene.label}. {scene.summary}
        </figcaption>

        <div className="-mx-1 flex snap-x snap-mandatory items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,0.92fr)_auto_minmax(0,1fr)] md:items-center md:gap-3 md:overflow-visible md:px-0 lg:gap-4 [&::-webkit-scrollbar]:hidden">
          <motion.div
            className="w-[min(78%,280px)] shrink-0 snap-center md:w-auto md:min-w-0"
            initial={false}
            animate={stageMotion(focus === 0, prefersReduced)}
            transition={prefersReduced ? { duration: 0.2 } : { duration: 0.75, ease: EASE }}
          >
            <HeroDocumentCard
              doc={scene.source}
              visible
              detailed
              scanning={step === "scan"}
              from="left"
              stacked
              enableFloat={focus === 0}
              reduced={prefersReduced}
            />
          </motion.div>

          <FlowArrow active={engineOn} />

          <motion.div
            className="w-[min(70%,240px)] shrink-0 snap-center md:w-auto md:min-w-0 md:-translate-y-1"
            initial={false}
            animate={stageMotion(focus === 1, prefersReduced)}
            transition={prefersReduced ? { duration: 0.2 } : { duration: 0.75, ease: EASE }}
          >
            <HeroEngineCard
              engine={scene.engine}
              visible
              running={step === "extract"}
              done={resultOn}
              stepsVisible={engineOn}
              reduced={prefersReduced}
              enableFloat={focus === 1}
            />
          </motion.div>

          <FlowArrow active={resultOn} />

          <motion.div
            className="w-[min(78%,280px)] shrink-0 snap-center md:w-auto md:min-w-0"
            initial={false}
            animate={stageMotion(focus === 2, prefersReduced)}
            transition={prefersReduced ? { duration: 0.2 } : { duration: 0.75, ease: EASE }}
          >
            <HeroDocumentCard
              doc={scene.result}
              visible
              detailed={resultOn || prefersReduced}
              peek={!resultOn && !prefersReduced}
              from="right"
              stacked
              floatDelay={1.1}
              enableFloat={focus === 2}
              reduced={prefersReduced}
            />
          </motion.div>
        </div>
      </figure>

      <HeroFlowControls
        focus={focus}
        onSelect={goToFlowFocus}
        onPrev={() => shiftFocus(-1)}
        onNext={() => shiftFocus(1)}
        className="mt-11 md:mt-14"
      />

      <p className="mt-3 text-center text-[11px] font-medium tracking-[0.04em] text-ink/40 uppercase">
        {DEMO_MARK} · {DEMO_NOTE}
      </p>
    </div>
  );
}
