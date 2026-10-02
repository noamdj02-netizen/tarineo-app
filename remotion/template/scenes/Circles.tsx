import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../constants";
import { GuideCross, Stage, clamp } from "../ui";

/** 0→1.5s — ellipse + ticks (ref frame 0-1). */
export const CirclesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [2, 28], [0, 1], clamp);
  const fade = interpolate(frame, [34, 45], [1, 0], clamp);

  return (
    <Stage>
      <GuideCross opacity={0.25 * fade} />
      <AbsoluteFill style={{ opacity: fade }}>
        <svg width="100%" height="100%" viewBox="0 0 1920 1080">
          <ellipse
            cx="960"
            cy="540"
            rx="280"
            ry="340"
            fill="none"
            stroke={C.ink}
            strokeWidth="1.15"
            strokeDasharray={2000}
            strokeDashoffset={2000 * (1 - draw)}
            opacity={0.5}
          />
          <line x1="678" y1="540" x2="694" y2="540" stroke={C.ink} strokeWidth="1.4" opacity={draw * 0.65} />
          <line x1="1226" y1="540" x2="1242" y2="540" stroke={C.ink} strokeWidth="1.4" opacity={draw * 0.65} />
        </svg>
      </AbsoluteFill>
    </Stage>
  );
};
