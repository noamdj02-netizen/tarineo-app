"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { HERO_SCENES } from "@/lib/site/product-demo";

/** Étapes du récit : arrivée du document → analyse → devis produit. */
export const HERO_STEPS = [
  "arrive",
  "scan",
  "engine",
  "extract",
  "build",
  "settle",
] as const;

export type HeroStep = (typeof HERO_STEPS)[number];

const DURATION: Record<HeroStep, number> = {
  arrive: 1300,
  scan: 1500,
  engine: 1100,
  extract: 3000,
  build: 1500,
  settle: 3400,
};

/** Vrai dès que la séquence a atteint `target`. */
export function reached(current: HeroStep, target: HeroStep) {
  return HERO_STEPS.indexOf(current) >= HERO_STEPS.indexOf(target);
}

/**
 * Pilote la séquence du hero : une étape à la fois, en boucle propre.
 * `active === false` (hors écran) met la boucle en pause.
 * Mouvement réduit : la scène est figée sur son état final, donc complète.
 */
export function useHeroSequence(active: boolean) {
  const prefersReduced = useReducedMotion();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (prefersReduced || !active) return;
    const id = setTimeout(
      () => setCursor((c) => (c + 1) % HERO_STEPS.length),
      DURATION[HERO_STEPS[cursor]!],
    );
    return () => clearTimeout(id);
  }, [cursor, active, prefersReduced]);

  const goToScene = useCallback((index: number) => {
    const count = HERO_SCENES.length;
    setSceneIndex(((index % count) + count) % count);
    setCursor(0);
  }, []);

  /** Saut vers une étape du récit (ex. contrôles 1 · 2 · 3 du flux cartes). */
  const goToStep = useCallback((step: HeroStep) => {
    const i = HERO_STEPS.indexOf(step);
    if (i >= 0) setCursor(i);
  }, []);

  const goToFlowFocus = useCallback(
    (focus: 0 | 1 | 2) => {
      const step: HeroStep = focus === 0 ? "arrive" : focus === 1 ? "engine" : "build";
      goToStep(step);
    },
    [goToStep],
  );

  return {
    scene: HERO_SCENES[sceneIndex]!,
    sceneIndex,
    sceneCount: HERO_SCENES.length,
    step: prefersReduced ? ("settle" as HeroStep) : HERO_STEPS[cursor]!,
    prefersReduced: Boolean(prefersReduced),
    goToScene,
    goToStep,
    goToFlowFocus,
    nextScene: useCallback(() => goToScene(sceneIndex + 1), [goToScene, sceneIndex]),
    prevScene: useCallback(() => goToScene(sceneIndex - 1), [goToScene, sceneIndex]),
  };
}
