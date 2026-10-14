"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";

/** Positions Figma hero 1440×1050 — pastilles blanches aux jonctions des circuits. */
const CIRCUIT_JOINTS: { top: string; left: string }[] = [
  { top: "8.57%", left: "31.46%" },
  { top: "8.57%", left: "67.71%" },
  { top: "34.38%", left: "16.11%" },
  { top: "34.38%", left: "83.75%" },
  { top: "44.57%", left: "18.89%" },
  { top: "44.57%", left: "80.83%" },
];

/**
 * Calques décoratifs export Figma (Rectangle 1691/1692, jonctions, chevron central).
 * Les tracés animés sont dans `HeroFigmaCircuits`.
 */
export function HeroFigmaDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[5] hidden h-[1050px] w-full lg:block"
    >
      <Image
        src="/landing/figma/hero/rectangle-1691.svg"
        alt=""
        width={724}
        height={612}
        className="absolute left-0 top-[233px] w-[min(724px,50.3vw)] max-w-none"
      />
      <Image
        src="/landing/figma/hero/rectangle-1692.svg"
        alt=""
        width={630}
        height={486}
        className="absolute left-[810px] top-[-47px] w-[min(630px,43.8vw)] max-w-none"
      />

      {CIRCUIT_JOINTS.map((joint, i) => (
        <span
          key={i}
          className="absolute h-2 w-3 rounded-[23px] bg-white shadow-[0_2px_2px_rgba(188,188,188,0.14)]"
          style={{ top: joint.top, left: joint.left }}
        />
      ))}

      <span
        className="absolute left-1/2 top-[572px] inline-flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-white px-2.5 py-1"
      >
        <ChevronRight className="size-4 text-[#ff642b]" strokeWidth={2.5} aria-hidden />
      </span>
    </div>
  );
}
