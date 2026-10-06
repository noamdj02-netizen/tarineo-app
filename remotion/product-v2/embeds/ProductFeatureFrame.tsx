import type { CSSProperties, ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { Grain, ProductShell } from "../ui";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

/** Cadre app (sidebar + canvas) — même `ProductShell` que Product V2. */
export function ProductFeatureFrame({
  activeNav,
  children,
  width = 1540,
  height = 880,
  grain = false,
  frameOffset = 0,
  shellStyle,
  skipEnter = false,
}: {
  activeNav: string;
  children: ReactNode;
  width?: number;
  height?: number;
  grain?: boolean;
  frameOffset?: number;
  shellStyle?: CSSProperties;
  /** Le parent gère l’entrée (ex. template). */
  skipEnter?: boolean;
}) {
  const frame = useCurrentFrame() + frameOffset;
  const enter = skipEnter ? 1 : interpolate(frame, [0, 16], [0, 1], clamp);

  return (
    <div
      style={{
        position: "relative",
        opacity: skipEnter ? 1 : enter,
        transform: skipEnter
          ? undefined
          : `translateY(${interpolate(enter, [0, 1], [22, 0])}px) scale(${interpolate(enter, [0, 1], [0.96, 1])})`,
      }}
    >
      {grain ? <Grain opacity={0.02} /> : null}
      <ProductShell
        activeNav={activeNav}
        width={width}
        height={height}
        padding={14}
        frameOffset={frameOffset}
        style={shellStyle}
      >
        {children}
      </ProductShell>
    </div>
  );
}
