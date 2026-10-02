import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { fontSans } from "../../fonts";
import { Grain } from "../components/Atmosphere";
import { DashboardMockup } from "../components/DashboardMockup";
import { COLORS } from "../constants";
import { DASH_HIGHLIGHTS } from "../data";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

export const DashboardHeroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 40], [0.94, 1], clamp);
  const x = interpolate(frame, [0, 120], [0, -18], clamp);
  const y = interpolate(frame, [0, 120], [8, -6], clamp);

  const highlightIndex = Math.min(
    4,
    Math.max(-1, Math.floor((frame - 18) / 18)),
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.canvas, fontFamily: fontSans }}>
      <Grain opacity={0.02} />
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translate(${x}px, ${y}px)`,
        }}
      >
        <DashboardMockup
          layerProgress={1}
          zoom={scale}
          highlight={highlightIndex >= 0 ? highlightIndex : null}
        />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 64,
          bottom: 48,
          display: "flex",
          gap: 10,
        }}
      >
        {DASH_HIGHLIGHTS.map((label, i) => {
          const on = highlightIndex === i;
          return (
            <span
              key={label}
              style={{
                fontSize: 13,
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: 999,
                background: on ? COLORS.accent : "rgba(10,10,10,0.06)",
                color: on ? COLORS.white : COLORS.muted,
                opacity: interpolate(frame, [10 + i * 4, 22 + i * 4], [0, 1], clamp),
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
