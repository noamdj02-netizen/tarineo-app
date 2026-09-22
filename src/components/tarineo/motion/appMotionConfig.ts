/** Motion produit — plus court et discret que la landing (100–250 ms). */
export const appEase = [0.16, 1, 0.3, 1] as const;

export const appSpring = {
  type: "spring" as const,
  stiffness: 140,
  damping: 24,
  mass: 0.7,
};

export const appSpringSoft = {
  type: "spring" as const,
  stiffness: 100,
  damping: 22,
  mass: 0.8,
};

export const appEnter = {
  opacity: 0,
  y: 12,
};

export const appEnterVisible = {
  opacity: 1,
  y: 0,
};
