import type { Transition } from "framer-motion";

/**
 * Référence motion Tarinéo — **Pop in** (spring avec léger overshoot).
 * Même vocabulaire partout : validation, page enter, onboarding, landing.
 *
 * Origine : succès Relance (`relance-dialog`).
 */

/** Cercle / marque de succès — Pop in + Scale in. */
export const POP_MARK: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 16,
  mass: 0.7,
};

/** Icône check — Scale in décalé (stagger). */
export const POP_CHECK: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 18,
  delay: 0.12,
};

/** Panneau / dialog qui apparaît. */
export const POP_PANEL: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 28,
  mass: 0.85,
};

/** Entrée de page — Pop in discret (pas d’overshoot fort). */
export const POP_PAGE: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 28,
  mass: 0.9,
};

/** Texte / CTA en cascade après la marque. */
export const POP_EASE = [0.2, 0.8, 0.2, 1] as const;

export function popTextTransition(delay: number, reduce?: boolean | null): Transition {
  if (reduce) return { duration: 0.12 };
  return { delay, duration: 0.28, ease: POP_EASE };
}
