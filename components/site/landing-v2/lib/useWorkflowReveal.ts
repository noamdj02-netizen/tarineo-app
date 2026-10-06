import { useEffect, type RefObject } from "react";

import { gsap, prefersReducedMotion } from "./motion";

/**
 * Fait apparaître un workflow étapes par étapes : chaque nœud surgit, puis le
 * segment orange qui le relie à l'étape suivante se déploie.
 *
 * La temporalité raconte la mécanique de Tarinéo (email → analyse → devis →
 * validation), elle n'est pas là pour décorer.
 */
export function useWorkflowReveal(ref: RefObject<HTMLElement | null>, start = "top 72%"): void {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal-node]"));
    const lines = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal-line]"));

    if (prefersReducedMotion()) {
      gsap.set([...nodes, ...lines], { clearProps: "opacity,transform" });
      return;
    }

    if (nodes.length === 0) return;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: root, start, once: true },
        defaults: { ease: "power2.out" },
      });

      timeline.fromTo(
        nodes,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.16 },
      );

      if (lines.length > 0) {
        timeline.fromTo(
          lines,
          { scaleY: 0 },
          { scaleY: 1, duration: 0.34, stagger: 0.16, transformOrigin: "top center" },
          // Démarre juste après le premier nœud, pour que le trait « circule ».
          0.22,
        );
      }
    }, root);

    return () => context.revert();
  }, [ref, start]);
}