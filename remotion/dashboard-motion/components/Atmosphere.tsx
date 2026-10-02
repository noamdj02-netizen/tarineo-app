import type { CSSProperties } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { COLORS } from "../constants";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

export function Glow({
  size = 520,
  intensity = 1,
  style,
}: {
  size?: number;
  intensity?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const breathe = interpolate(frame % 90, [0, 45, 90], [0.85, 1, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,107,26,${0.18 * intensity * breathe}) 0%, rgba(255,107,26,${0.05 * intensity}) 38%, transparent 70%)`,
        filter: "blur(8px)",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

export function Grid({ opacity = 0.035 }: { opacity?: number }) {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 900], [0, -40], clamp);

  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundImage: `
          linear-gradient(rgba(255,107,26,0.55) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,107,26,0.55) 1px, transparent 1px)
        `,
        backgroundSize: "64px 64px",
        backgroundPosition: `0 ${drift}px`,
        maskImage:
          "radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 75%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 75%)",
        pointerEvents: "none",
      }}
    />
  );
}

export function Grain({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
}

export function TextReveal({
  children,
  start,
  duration = 18,
  distance = 20,
  blur = 8,
  style,
}: {
  children: React.ReactNode;
  start: number;
  duration?: number;
  distance?: number;
  blur?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const input = [start, start + duration] as const;
  const opacity = interpolate(frame, input, [0, 1], clamp);
  const y = interpolate(frame, input, [distance, 0], clamp);
  const b = interpolate(frame, input, [blur, 0], clamp);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        filter: `blur(${b}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
