"use client";

import { motion, useReducedMotion } from "framer-motion";

import { getHeroFigmaCircuitTrack } from "@/components/site/landing-v2/lib/hero-figma-circuit-motion";
import {
  LANDING_CIRCUIT_CURRENT,
  LANDING_CIRCUIT_DURATION,
  LANDING_CIRCUIT_TIMES,
} from "@/components/site/landing-v2/lib/landing-circuit-motion";

type Segment = {
  id: string;
  figmaNodeId: string;
  x: number;
  y: number;
  d: string;
  stroke: string;
  trackOpacity: number;
  currentStroke?: string;
};

/** Positions + paths depuis export `hero-designs-28` (Anima / Figma `235:33214`). */
const SEGMENTS: Segment[] = [
  {
    id: "10",
    figmaNodeId: "235:33260",
    x: 867,
    y: 90,
    d: "M0 42H46.9237C58.5217 42 67.9237 32.598 67.9237 21C67.9237 9.40202 77.3258 0 88.9237 0H229",
    stroke: "#FF6B1A",
    trackOpacity: 1,
  },
  {
    id: "11",
    figmaNodeId: "235:33304",
    x: 344,
    y: 90,
    d: "M229 42H182.076C170.478 42 161.076 32.598 161.076 21C161.076 9.40202 151.674 0 140.076 0H-4.05312e-06",
    stroke: "#FF6B1A",
    trackOpacity: 1,
  },
  {
    id: "12",
    figmaNodeId: "235:33348",
    x: 0,
    y: 400,
    d: "M343 72H272.263C255.142 72 241.263 58.1208 241.263 41V31C241.263 13.8792 227.384 0 210.263 0H1.66893e-06",
    stroke: "#FF6B1A",
    trackOpacity: 1,
  },
  {
    id: "14",
    figmaNodeId: "235:33392",
    x: 10,
    y: 365,
    d: "M404 107H315.169C298.049 107 284.169 93.1208 284.169 76V31C284.169 13.8792 270.29 0 253.169 0H-1.52588e-05",
    stroke: "#FF6B1A",
    trackOpacity: 1,
  },
  {
    id: "15",
    figmaNodeId: "235:33436",
    x: 1036,
    y: 365,
    d: "M0 107H88.8305C105.951 107 119.831 93.1208 119.831 76V31C119.831 13.8792 133.71 0 150.831 0H404",
    stroke: "#FF6B1A",
    trackOpacity: 1,
  },
  {
    id: "13",
    figmaNodeId: "235:33480",
    x: 1097,
    y: 400,
    d: "M0 72H70.7373C87.8581 72 101.737 58.1208 101.737 41V31C101.737 13.8792 115.616 0 132.737 0H343",
    stroke: "#FF6B1A",
    trackOpacity: 1,
  },
  {
    id: "1",
    figmaNodeId: "235:33733",
    x: 131,
    y: 472,
    d: "M0 2.46532e-05L282 0",
    stroke: "#FF6B1A",
    trackOpacity: 0.35,
  },
  {
    id: "9",
    figmaNodeId: "235:33777",
    x: 1016,
    y: 472,
    d: "M0 2.46532e-05L282 0",
    stroke: "#FF6B1A",
    trackOpacity: 0.5,
  },
  {
    id: "5",
    figmaNodeId: "235:33821",
    x: 478,
    y: 584,
    d: "M0 4.1351e-05L473 0",
    stroke: "#FF6B1A",
    trackOpacity: 0.5,
  },
  {
    id: "3",
    figmaNodeId: "235:33865",
    x: 439,
    y: 511,
    d: "M0 50L2.18557e-06 -7.7486e-07",
    stroke: "#FFFFFF",
    trackOpacity: 0.9,
  },
  {
    id: "7",
    figmaNodeId: "235:33909",
    x: 990,
    y: 511,
    d: "M0 50L2.18557e-06 -7.7486e-07",
    stroke: "#FF6B1A",
    trackOpacity: 0.5,
  },
  {
    id: "2",
    figmaNodeId: "235:33953",
    x: 413,
    y: 472,
    d: "M0 0C14.3594 0 26 11.6406 26 26V39",
    stroke: "#FF6B1A",
    trackOpacity: 0.5,
  },
  {
    id: "8",
    figmaNodeId: "235:33997",
    x: 1016,
    y: 472,
    d: "M26 0C11.6406 0 -3.8743e-07 11.6406 -3.8743e-07 26V39",
    stroke: "#F8D3D4",
    trackOpacity: 0.9,
    currentStroke: "#FF6B1A",
  },
  {
    id: "4",
    figmaNodeId: "235:34041",
    x: 439,
    y: 557,
    d: "M0 1.70474e-06C6.51811e-07 14.9117 12.0883 27 27 27L39 27",
    stroke: "#F8D3D4",
    trackOpacity: 0.9,
    currentStroke: "#FF6B1A",
  },
  {
    id: "6",
    figmaNodeId: "235:34085",
    x: 990,
    y: 557,
    d: "M39 1.70474e-06C39 14.9117 26.9117 27 12 27L4.17229e-07 27",
    stroke: "#F8D3D4",
    trackOpacity: 0.9,
    currentStroke: "#FF6B1A",
  },
];

function HeroCircuitCurrentPath({
  seg,
  reduce,
}: {
  seg: Segment;
  reduce: boolean | null;
}) {
  if (reduce) return null;

  const track = getHeroFigmaCircuitTrack(seg.figmaNodeId);
  const animate = track
    ? {
        opacity: track.opacity,
        strokeDasharray: track.strokeDasharray,
        strokeDashoffset: track.strokeDashoffset,
      }
    : LANDING_CIRCUIT_CURRENT;
  const transition = track
    ? {
        duration: track.duration,
        ease: "linear" as const,
        times: track.times,
        repeat: Infinity,
      }
    : {
        duration: LANDING_CIRCUIT_DURATION,
        ease: "linear" as const,
        times: [...LANDING_CIRCUIT_TIMES],
        repeat: Infinity,
      };

  return (
    <motion.path
      data-node-id={seg.figmaNodeId}
      d={seg.d}
      pathLength={1}
      stroke={seg.currentStroke ?? "#FF6B1A"}
      strokeOpacity={0.95}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ opacity: 0, strokeDasharray: "0 1", strokeDashoffset: 0 }}
      animate={animate}
      transition={transition}
    />
  );
}

/** Circuits hero Figma — pistes SVG + courant animé (path-trim 8,877 s, keyframes Figma). */
export function HeroFigmaCircuits() {
  const reduce = useReducedMotion();

  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 1050"
      preserveAspectRatio="none"
      height="1050"
      className="pointer-events-none absolute inset-0 z-[8] hidden h-[1050px] w-full text-[#ff6b1a] lg:block"
      fill="none"
    >
      {SEGMENTS.map((seg) => (
        <g key={seg.id} transform={`translate(${seg.x} ${seg.y})`}>
          <path
            d={seg.d}
            stroke={seg.stroke}
            strokeOpacity={seg.trackOpacity}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <HeroCircuitCurrentPath seg={seg} reduce={reduce} />
        </g>
      ))}
    </svg>
  );
}
