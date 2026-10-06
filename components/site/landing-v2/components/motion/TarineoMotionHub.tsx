"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

import {
  MOTION_HUB_RING_NODES,
  MOTION_HUB_RING_POSITIONS,
  MOTION_HUB_VIEW,
  type MotionHubScenario,
} from "@/lib/site/landing-motion-hub";
import { MotionConnectionLayer } from "@/components/site/landing-v2/components/motion/MotionConnectionLayer";
import {
  MotionNodeCard,
  type CardStateTone,
} from "@/components/site/landing-v2/components/motion/MotionNodeCard";
import { TarineoEngine } from "@/components/site/landing-v2/components/motion/TarineoEngine";
import {
  useMotionHubLoop,
  type MotionHubPhase,
} from "@/components/site/landing-v2/components/motion/useMotionHubLoop";
import { LANDING_EASE, LANDING_VIEW } from "@/components/site/landing-v2/lib/landing-motion";

function posStyle(x: number, y: number) {
  const { width, height } = MOTION_HUB_VIEW;
  return {
    left: `${(x / width) * 100}%`,
    top: `${(y / height) * 100}%`,
    transform: "translate(-50%, -50%)",
  } as const;
}

const CARD_REVEAL_BASE = 0.22;

function inputCardPresentation(
  phase: MotionHubPhase,
  scenario: MotionHubScenario,
  nodeSub: string,
  nodeIdle: string,
): { label: string; tone: CardStateTone } {
  if (phase === "source-in") {
    return { label: nodeSub, tone: "idle" };
  }
  if (phase === "signal-in" || phase === "analyze") {
    return { label: scenario.inputStateAnalyzing, tone: "analyzing" };
  }
  if (phase === "insight" || phase === "signal-out" || phase === "result") {
    return { label: scenario.inputStateDone, tone: "success" };
  }
  return { label: nodeIdle, tone: "idle" };
}

function outputCardPresentation(
  phase: MotionHubPhase,
  scenario: MotionHubScenario,
  nodeIdle: string,
): { label: string; tone: CardStateTone } {
  if (phase === "signal-out") {
    return { label: scenario.outputStateTransmitting, tone: "analyzing" };
  }
  if (phase === "result") {
    return { label: scenario.outputStateBusiness, tone: "business" };
  }
  return { label: nodeIdle, tone: "idle" };
}

export function TarineoMotionHub() {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { ...LANDING_VIEW, amount: 0.3 });
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (inView) setRevealed(true);
  }, [inView]);

  const { phase, scenario, scenarioIndex, signalInT, signalOutT, hubPulse, reduced } =
    useMotionHubLoop(inView);

  const inputIdx = scenario.inputRingIndex;
  const outputIdx = scenario.outputRingIndex;

  const inputActive =
    phase === "source-in" ||
    phase === "signal-in" ||
    phase === "analyze" ||
    phase === "insight";
  const outputActive = phase === "signal-out" || phase === "result";

  const showFlow =
    !reduced && (phase === "signal-in" || phase === "signal-out");

  const showHubStatus =
    phase === "analyze" ||
    phase === "insight" ||
    phase === "signal-out" ||
    phase === "result";

  const hubStatusLabel =
    phase === "analyze"
      ? scenario.hubStatus
      : phase === "insight"
        ? scenario.insight
        : phase === "signal-out"
          ? "Transmission…"
          : phase === "result"
            ? scenario.result
            : undefined;

  const inputNode = MOTION_HUB_RING_NODES[inputIdx];
  const outputNode = MOTION_HUB_RING_NODES[outputIdx];

  const inputPresentation = inputActive
    ? inputCardPresentation(phase, scenario, inputNode.sub, inputNode.stateIdle)
    : { label: inputNode.stateIdle, tone: "idle" as CardStateTone };

  const outputPresentation = outputActive
    ? outputCardPresentation(phase, scenario, outputNode.stateIdle)
    : { label: outputNode.stateIdle, tone: "idle" as CardStateTone };

  const pulseKey = `${scenarioIndex}-${phase === "analyze" ? "analyze" : "idle"}`;

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-5xl">
      <div
        className="relative mx-auto hidden w-full sm:block"
        style={{ aspectRatio: `${MOTION_HUB_VIEW.width} / ${MOTION_HUB_VIEW.height}` }}
      >
        <MotionConnectionLayer
          inputIndex={inputIdx}
          outputIndex={outputIdx}
          signalInT={signalInT}
          signalOutT={signalOutT}
          showFlow={showFlow}
          flowInGlyph={scenario.flowInGlyph}
          flowOutGlyph={scenario.flowOutGlyph}
          reduced={reduced}
        />

        <div
          className="absolute z-20 flex w-full max-w-[14rem] justify-center"
          style={posStyle(MOTION_HUB_VIEW.hub.x, MOTION_HUB_VIEW.hub.y)}
        >
          <TarineoEngine
            status={showHubStatus || reduced ? hubStatusLabel ?? scenario.hubStatus : undefined}
            pulse={hubPulse && !reduced}
            pulseKey={pulseKey}
            reduced={reduced}
            revealed={revealed}
          />
        </div>

        {MOTION_HUB_RING_NODES.map((node, i) => {
          const isInput = i === inputIdx;
          const isOutput = i === outputIdx;
          const dimmed = !isInput && !isOutput;

          let stateLabel = node.stateIdle;
          let stateTone: CardStateTone = "idle";

          if (isInput) {
            stateLabel = inputPresentation.label;
            stateTone = inputPresentation.tone;
          } else if (isOutput) {
            stateLabel = outputPresentation.label;
            stateTone = outputPresentation.tone;
          }

          return (
            <div
              key={node.id}
              className="absolute z-10"
              style={posStyle(MOTION_HUB_RING_POSITIONS[i].x, MOTION_HUB_RING_POSITIONS[i].y)}
            >
              <MotionNodeCard
                node={node}
                active={(isInput && inputActive) || (isOutput && outputActive)}
                dimmed={dimmed}
                stateLabel={stateLabel}
                stateTone={stateTone}
                revealDelay={CARD_REVEAL_BASE + i * 0.09}
                revealed={revealed}
                reduced={reduced}
              />
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 sm:hidden">
        <MotionNodeCard
          node={inputNode}
          active={inputActive}
          stateLabel={inputPresentation.label}
          stateTone={inputPresentation.tone}
          revealed={revealed}
          reduced={reduced}
          revealDelay={0.14}
        />
        <div className="flex justify-center" aria-hidden>
          <div className="h-10 w-px bg-gradient-to-b from-accent/40 to-accent/10" />
        </div>
        <TarineoEngine
          status={hubStatusLabel ?? scenario.hubStatus}
          pulse={hubPulse && !reduced}
          pulseKey={pulseKey}
          reduced={reduced}
          revealed={revealed}
        />
        {(phase === "insight" || phase === "result" || reduced) && (
          <motion.p
            className="text-center text-sm font-medium text-ink-700"
            initial={false}
            animate={{ opacity: 1 }}
          >
            {scenario.insight}
          </motion.p>
        )}
        <div className="flex justify-center" aria-hidden>
          <div className="h-10 w-px bg-gradient-to-b from-accent/40 to-accent/10" />
        </div>
        <MotionNodeCard
          node={outputNode}
          active={outputActive}
          stateLabel={outputPresentation.label}
          stateTone={outputPresentation.tone}
          revealed={revealed}
          reduced={reduced}
          revealDelay={0.22}
        />
      </div>

      <motion.div
        className="mt-8 rounded-lg border border-line bg-paper-0 px-5 py-4 sm:mt-10"
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={revealed || reduced ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: LANDING_EASE, delay: 0.35 }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow text-ink-400">{scenario.title}</p>
            <p className="mt-1.5 text-sm font-medium text-ink-900">
              {(phase === "insight" ||
                phase === "signal-out" ||
                phase === "result" ||
                reduced) &&
                scenario.insight}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-sm font-semibold text-accent-700 nums">
              {(phase === "result" || reduced) && scenario.outputStateBusiness}
            </p>
            <p className="mt-0.5 text-xs font-medium text-ink-500">
              {(phase === "result" || reduced) && scenario.action}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
