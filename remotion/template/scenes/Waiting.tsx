import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TarineoLogoMark } from "../../components/TarineoLogoMark";
import { C } from "../constants";
import { COPY } from "../data";
import { PillBar, Stage, clamp } from "../ui";

/** 8.5→10s — barre vide + étoile → « Fini le chaos… » (ref). */
export const WaitingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const star = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const emptyBar = spring({ frame: frame - 4, fps, config: { damping: 16, stiffness: 110 } });
  const filled = interpolate(frame, [18, 28], [0, 1], clamp);

  return (
    <Stage>
      {/* sparkle top-left like ref blue star → orange */}
      <div
        style={{
          position: "absolute",
          left: 280,
          top: 180,
          opacity: star * (1 - filled * 0.85),
          transform: `scale(${0.7 + star * 0.3}) rotate(${star * 20}deg)`,
        }}
      >
        <svg width={72} height={72} viewBox="0 0 120 120">
          <path d="M60 6 L70 46 L110 60 L70 74 L60 114 L50 74 L10 60 L50 46 Z" fill={C.accent} />
        </svg>
      </div>

      <AbsoluteFill style={{ display: "grid", placeItems: "center" }}>
        <div
          style={{
            opacity: emptyBar,
            transform: `translateY(${(1 - emptyBar) * 16}px) scale(${0.96 + emptyBar * 0.04})`,
          }}
        >
          <PillBar width={560} style={{ minHeight: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: C.soft,
                  border: `1px solid ${C.border}`,
                }}
              />
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 550,
                  letterSpacing: "-0.02em",
                  opacity: filled,
                  color: C.ink,
                }}
              >
                {COPY.waiting}
              </span>
              {!filled ? (
                <span
                  style={{
                    width: 2,
                    height: 20,
                    background: C.ink,
                    opacity: Math.floor(frame / 7) % 2 === 0 ? 1 : 0,
                  }}
                />
              ) : null}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: C.soft,
                borderRadius: 999,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 3,
                  border: `1.5px solid ${C.muted}`,
                }}
              />
              {COPY.addTask}
              <span style={{ color: C.muted, fontSize: 11 }}>▾</span>
            </div>
          </PillBar>
        </div>
      </AbsoluteFill>

      {/* tiny logo mark top — replaces brand mark presence */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 48,
          opacity: interpolate(frame, [0, 12], [0, 0.7], clamp),
        }}
      >
        <TarineoLogoMark size={28} variant="light" />
      </div>
    </Stage>
  );
};
