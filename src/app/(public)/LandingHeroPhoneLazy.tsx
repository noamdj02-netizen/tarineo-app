"use client";

import dynamic from "next/dynamic";

const LandingHeroPhoneComposition = dynamic(
  () => import("./LandingHeroPhoneComposition").then((m) => ({ default: m.LandingHeroPhoneComposition })),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto aspect-[886/520] w-full max-w-[886px] min-h-[280px] sm:min-h-[400px]" aria-hidden />
    ),
  }
);

export function LandingHeroPhoneLazy() {
  return <LandingHeroPhoneComposition />;
}
