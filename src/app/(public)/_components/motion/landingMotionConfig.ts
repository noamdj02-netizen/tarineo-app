/** Courbes partagées landing — style Framer, ressorts doux. */
export const landingEase = [0.16, 1, 0.3, 1] as const;

export const landingSpring = {
  type: "spring" as const,
  stiffness: 120,
  damping: 22,
  mass: 0.8,
};

export const landingSpringSoft = {
  type: "spring" as const,
  stiffness: 80,
  damping: 20,
  mass: 1,
};

export const landingFloatTransition = {
  duration: 5,
  repeat: Infinity,
  repeatType: "mirror" as const,
  ease: "easeInOut" as const,
};
