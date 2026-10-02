"use client";

/** Fond hero — tokens `landing-hero` + accent marque. */
export function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-clip">
      <div className="absolute inset-0 bg-landing-hero" />
      <div className="absolute inset-0 hero-backdrop-wash" />
      <div className="absolute inset-0 hero-backdrop-accent" />
    </div>
  );
}
