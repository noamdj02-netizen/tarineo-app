"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Timeline Figma : 8.877 s, loop, path-trim. Même animation, delays différents. */
const DURATION = 8.877;
const TIMES = [0, 0.09, 0.125, 0.313, 0.349, 0.404, 0.44, 0.628, 0.664, 0.72, 0.756, 0.944, 0.98, 1];

const TRACKS = [
  "M 396 180 H 180",
  "M 1044 180 H 1260",
  "M 180 180 C 80 180 48 280 48 360",
  "M 1260 180 C 1360 180 1392 280 1392 360",
  "M 48 360 C 48 430 160 470 250 470",
  "M 1392 360 C 1392 430 1280 470 1190 470",
  "M 250 470 H 1190",
] as const;

export function LandingCircuit() {
  const reduce = useReducedMotion();

  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 620"
      className="pointer-events-none absolute inset-x-0 top-[120px] hidden h-[520px] w-full md:block"
      fill="none"
    >
      {TRACKS.map((d) => (
        <path key={d} d={d} stroke="var(--color-brand-orange)" strokeOpacity={0.28} strokeWidth="2" strokeLinecap="round" />
      ))}
      {reduce
        ? null
        : TRACKS.map((d, i) => (
            <motion.path
              key={`current-${i}`}
              d={d}
              pathLength={1}
              stroke="var(--color-brand-orange)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 1", strokeDashoffset: 0, opacity: 0 }}
              animate={{
                opacity: [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
                strokeDasharray: ["0 1", "0 1", "0.16 1", "0.16 1", "0 1", "0 1", "0.16 1", "0.16 1", "0 1", "0 1", "0.16 1", "0.16 1", "0 1", "0 1"],
                strokeDashoffset: [0, 0, 0, -0.84, -1, 0, 0, -0.84, -1, 0, 0, -0.84, -1, -1],
              }}
              transition={{
                duration: DURATION,
                ease: "linear",
                times: TIMES,
                repeat: Infinity,
                delay: i * 0.08,
              }}
            />
          ))}
    </svg>
  );
}
