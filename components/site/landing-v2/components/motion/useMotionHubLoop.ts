"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { MOTION_HUB_SCENARIOS } from "@/lib/site/landing-motion-hub";

export type MotionHubPhase =
  | "idle"
  | "source-in"
  | "signal-in"
  | "analyze"
  | "insight"
  | "signal-out"
  | "result"
  | "reset";

const CYCLE_MS = 11_000;
const TICK_MS = 100;

const PHASE_WINDOWS: { phase: MotionHubPhase; start: number; end: number }[] = [
  { phase: "idle", start: 0, end: 0.07 },
  { phase: "source-in", start: 0.07, end: 0.15 },
  { phase: "signal-in", start: 0.15, end: 0.34 },
  { phase: "analyze", start: 0.34, end: 0.48 },
  { phase: "insight", start: 0.48, end: 0.58 },
  { phase: "signal-out", start: 0.58, end: 0.74 },
  { phase: "result", start: 0.74, end: 0.9 },
  { phase: "reset", start: 0.9, end: 1 },
];

function phaseAt(progress: number): MotionHubPhase {
  const p = progress % 1;
  return PHASE_WINDOWS.find((w) => p >= w.start && p < w.end)?.phase ?? "idle";
}

export function useMotionHubLoop(active: boolean) {
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [scenarioIndex, setScenarioIndex] = useState(0);

  useEffect(() => {
    if (!active || reduce) {
      setProgress(0);
      setScenarioIndex(0);
      return;
    }

    const started = performance.now();
    const id = window.setInterval(() => {
      const elapsed = performance.now() - started;
      const p = (elapsed % CYCLE_MS) / CYCLE_MS;
      setProgress(p);
      setScenarioIndex(Math.floor(elapsed / CYCLE_MS) % MOTION_HUB_SCENARIOS.length);
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [active, reduce]);

  const phase = reduce ? "result" : phaseAt(progress);
  const p = progress % 1;

  const signalInT =
    phase === "signal-in"
      ? Math.min(1, (p - 0.15) / 0.19)
      : ["analyze", "insight", "signal-out", "result"].includes(phase)
        ? 1
        : 0;

  const signalOutT =
    phase === "signal-out" ? Math.min(1, (p - 0.58) / 0.16) : phase === "result" ? 1 : 0;

  /** Un seul pulse pendant la phase analyse */
  const hubPulse = phase === "analyze";

  return {
    phase,
    progress: p,
    scenarioIndex,
    scenario: MOTION_HUB_SCENARIOS[scenarioIndex],
    signalInT,
    signalOutT,
    hubPulse,
    reduced: Boolean(reduce),
  };
}
