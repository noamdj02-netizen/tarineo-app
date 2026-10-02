import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { fontMono, fontSans } from "../fonts";

/** Fond + centrage responsive 16:9 / 9:16. */
export function Stage({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const padX = portrait ? 48 : 96;
  const padY = portrait ? 120 : 72;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        fontFamily: fontSans,
        color: COLORS.text,
        WebkitFontSmoothing: "antialiased",
        ...style,
      }}
    >
      {/* Atmosphère discrète */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 42%, rgba(236,88,33,0.045) 0%, transparent 62%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: `${padY}px ${padX}px`,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: portrait ? 920 : 1100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: portrait ? 28 : 24,
          }}
        >
          {children}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export function SurfaceCard({
  children,
  style,
  lift = false,
}: {
  children: ReactNode;
  style?: CSSProperties;
  lift?: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 20,
        boxShadow: lift
          ? "0 0 0 1px rgba(17,17,17,0.05), 0 8px 24px rgba(17,17,17,0.06), 0 32px 64px -28px rgba(17,17,17,0.22)"
          : "0 0 0 1px rgba(17,17,17,0.04), 0 2px 8px rgba(17,17,17,0.04), 0 24px 48px -24px rgba(17,17,17,0.18)",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function MonoLabel({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: fontMono,
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: COLORS.muted,
      }}
    >
      {children}
    </p>
  );
}
