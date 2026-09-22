import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { TOKENS } from "../theme";

export function DashboardScene({
  children,
  title,
  subtitle,
  delay = 0,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  delay?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 90 } });
  const scale = interpolate(enter, [0, 1], [1.04, 1]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const titleOpacity = interpolate(frame, [delay + 8, delay + 45, delay + 70], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: TOKENS.pageBg, overflow: "hidden" }}>
      <div
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          opacity,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>

      {(title || subtitle) && (
        <AbsoluteFill
          style={{
            justifyContent: "flex-start",
            alignItems: "center",
            paddingTop: 48,
            pointerEvents: "none",
            opacity: titleOpacity,
            background: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.6) 35%, transparent 70%)",
          }}
        >
          {title && <AnimatedText delay={delay} size={40} color={TOKENS.foreground}>{title}</AnimatedText>}
          {subtitle && (
            <>
              <div style={{ height: 10 }} />
              <AnimatedText delay={delay + 8} size={18} weight={400} color={TOKENS.mutedForeground}>
                {subtitle}
              </AnimatedText>
            </>
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
}
