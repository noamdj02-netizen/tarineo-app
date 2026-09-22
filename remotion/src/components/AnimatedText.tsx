import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT } from "../theme";

export function AnimatedText({
  children,
  delay = 0,
  size = 64,
  color = COLORS.white,
  weight = 700,
  align = "center" as const,
}: {
  children: string;
  delay?: number;
  size?: number;
  color?: string;
  weight?: number;
  align?: "left" | "center" | "right";
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120 } });
  const y = interpolate(progress, [0, 1], [40, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        textAlign: align,
        transform: `translateY(${y}px)`,
        opacity,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
      }}
    >
      {children}
    </div>
  );
}
