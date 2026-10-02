import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { fontSans } from "../../fonts";
import { Grain } from "../components/Atmosphere";
import { DashboardMockup } from "../components/DashboardMockup";
import { COLORS } from "../constants";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

/** Trait orange → dashboard en couches. */
export const ArriveScene: React.FC = () => {
  const frame = useCurrentFrame();

  const slash = interpolate(frame, [0, 18], [0, 1], clamp);
  const slashY = interpolate(frame, [0, 18], [40, 0], clamp);
  const slashFade = interpolate(frame, [14, 28], [1, 0], clamp);

  const layerProgress = interpolate(frame, [16, 78], [0, 1], clamp);
  const dashScale = interpolate(frame, [16, 50], [0.9, 0.96], clamp);
  const dashY = interpolate(frame, [16, 50], [40, 0], clamp);
  const bg = interpolate(frame, [10, 40], [0, 1], clamp);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.ink,
        fontFamily: fontSans,
      }}
    >
      <AbsoluteFill
        style={{
          background: COLORS.canvas,
          opacity: bg * 0.98,
        }}
      />
      <Grain opacity={0.025} />

      {/* Orange slash */}
      <div
        style={{
          position: "absolute",
          left: "-10%",
          top: "46%",
          width: "120%",
          height: 4,
          borderRadius: 999,
          background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
          opacity: slash * slashFade,
          transform: `translateY(${slashY}px) scaleX(${slash})`,
          boxShadow: `0 0 24px rgba(255,107,26,0.35)`,
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${dashY}px)`,
        }}
      >
        <DashboardMockup layerProgress={layerProgress} zoom={dashScale} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
