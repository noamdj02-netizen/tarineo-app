"use client";

import { motion } from "framer-motion";

import {
  hubCurve,
  MOTION_HUB_RING_POSITIONS,
  MOTION_HUB_VIEW,
} from "@/lib/site/landing-motion-hub";
import { getPointOnPath } from "@/components/site/landing-v2/components/motion/motion-hub-geometry";
import { LANDING_EASE } from "@/components/site/landing-v2/lib/landing-motion";

type Props = {
  inputIndex: number;
  outputIndex: number;
  signalInT: number;
  signalOutT: number;
  showFlow: boolean;
  flowInGlyph: string;
  flowOutGlyph: string;
  reduced?: boolean;
};

function FlowPayload({
  x,
  y,
  glyph,
}: {
  x: number;
  y: number;
  glyph: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={9} className="fill-paper-0 stroke-accent/40" strokeWidth={1} />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-accent-700 text-[7px] font-semibold nums"
        style={{ fontFamily: "var(--font-sans, system-ui, sans-serif)" }}
      >
        {glyph}
      </text>
    </g>
  );
}

export function MotionConnectionLayer({
  inputIndex,
  outputIndex,
  signalInT,
  signalOutT,
  showFlow,
  flowInGlyph,
  flowOutGlyph,
  reduced = false,
}: Props) {
  const { hub, width, height } = MOTION_HUB_VIEW;

  const spokes = MOTION_HUB_RING_POSITIONS.map((pos, i) => ({
    id: `spoke-${i}`,
    d: hubCurve(pos, hub),
    dim: i !== inputIndex && i !== outputIndex,
    role: i === inputIndex ? "in" : i === outputIndex ? "out" : ("idle" as const),
  }));

  const inD = hubCurve(MOTION_HUB_RING_POSITIONS[inputIndex], hub);
  const outD = hubCurve(hub, MOTION_HUB_RING_POSITIONS[outputIndex]);

  const flowIn =
    showFlow && signalInT > 0.02 ? getPointOnPath(inD, signalInT) : null;
  const flowOut =
    showFlow && signalOutT > 0.02 ? getPointOnPath(outD, signalOutT) : null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full text-ink-300/90"
      fill="none"
      aria-hidden
    >
      {spokes.map((s) => (
        <motion.path
          key={s.id}
          d={s.d}
          stroke="currentColor"
          strokeWidth={s.role !== "idle" ? 1.5 : 1}
          strokeLinecap="round"
          className={s.role !== "idle" ? "!text-accent/55" : undefined}
          initial={false}
          animate={{ opacity: s.dim ? 0.18 : s.role !== "idle" ? 0.9 : 0.35 }}
          transition={{ duration: 0.45, ease: LANDING_EASE }}
        />
      ))}

      {!reduced ? (
        <circle
          cx={hub.x}
          cy={hub.y}
          r={54}
          className="fill-accent/[0.05] stroke-accent/12"
          strokeWidth={1}
        />
      ) : null}

      {flowIn ? <FlowPayload x={flowIn.x} y={flowIn.y} glyph={flowInGlyph} /> : null}
      {flowOut ? <FlowPayload x={flowOut.x} y={flowOut.y} glyph={flowOutGlyph} /> : null}
    </svg>
  );
}
