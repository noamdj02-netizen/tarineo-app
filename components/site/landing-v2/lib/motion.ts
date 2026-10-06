import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** L'utilisateur a-t-il demandé à réduire les animations ? */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Active l'état initial masqué des animations.
 * Appelé uniquement lorsque le JS est prêt et que le mouvement est autorisé,
 * de sorte que le contenu reste lisible en cas d'échec du script.
 */
export function enableMotion(): void {
  if (typeof document === "undefined") return;
  if (prefersReducedMotion()) return;
  document.documentElement.classList.add("js-motion");
}

type RevealConfig = {
  /** Décalage vertical d'apparition, en pixels. */
  y?: number;
  /** Décalage entre deux éléments révélés. */
  stagger?: number;
  delay?: number;
  /** Déclencheur du défilement. */
  start?: string;
  /** Sélecteur des éléments révélés dans la section. */
  selector?: string;
};

/**
 * Révèle progressivement au défilement les éléments marqués `data-reveal`
 * à l'intérieur d'une section, puis se met à jour au redimensionnement.
 *
 * L'animation est volontairement courte, sobre et non répétée : elle sert à
 * guider l'œil, pas à décorer.
 */
export function useReveal<T extends HTMLElement>(
  ref: RefObject<T | null>,
  config: RevealConfig = {},
): void {
  const { y = 18, stagger = 0.07, delay = 0, start = "top 78%", selector = "[data-reveal]" } = config;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (targets.length === 0) return;

    if (prefersReducedMotion()) {
      gsap.set(targets, { clearProps: "opacity,transform" });
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger,
          delay,
          overwrite: "auto",
          scrollTrigger: { trigger: root, start, once: true },
        },
      );
    }, root);

    return () => context.revert();
  }, [ref, y, stagger, delay, start, selector]);
}

export { gsap, ScrollTrigger };