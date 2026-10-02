import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { TarineoLogoMark } from "../../components/TarineoLogoMark";
import { C, SHADOW } from "../constants";
import { ECO_NODES } from "../data";
import { Grain, Stage } from "../ui";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

export const EcosystemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const spin = interpolate(frame, [0, 100], [0, 32], clamp);
  const settle = interpolate(frame, [72, 110], [0, 1], clamp);
  const radius = interpolate(settle, [0, 1], [260, 228], clamp);
  const squarePulse = interpolate(frame, [0, 40, 80, 120], [1, 1.04, 1.02, 1], clamp);

  return (
    <Stage>
      <Grain />
      <AbsoluteFill>
        {/* Orbit ring */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "48%",
            width: radius * 2 + 40,
            height: radius * 2 + 40,
            marginLeft: -(radius + 20),
            marginTop: -(radius + 20),
            borderRadius: 40,
            border: `1px dashed ${C.border}`,
            opacity: interpolate(frame, [10, 30], [0, 0.7], clamp),
            transform: `rotate(${spin * 0.4}deg)`,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "48%",
            transform: `translate(-50%, -50%) scale(${squarePulse})`,
            width: 168,
            height: 168,
            borderRadius: 28,
            background: C.ink,
            color: C.white,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: SHADOW,
            opacity: interpolate(frame, [0, 16], [0, 1], clamp),
          }}
        >
          <TarineoLogoMark size={36} variant="dark" />
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.14em" }}>TARINEO</span>
        </div>

        {ECO_NODES.map((label, i) => {
          const angle =
            (i / ECO_NODES.length) * Math.PI * 2 - Math.PI / 2 + ((spin * (1 - settle * 0.85)) * Math.PI) / 180;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const op = interpolate(frame, [8 + i * 5, 22 + i * 5], [0, 1], clamp);
          return (
            <div
              key={label}
              style={{
                position: "absolute",
                left: "50%",
                top: "48%",
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                opacity: op,
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "12px 18px",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.06em",
                boxShadow: SHADOW,
              }}
            >
              {label}
            </div>
          );
        })}

        <p
          style={{
            position: "absolute",
            bottom: 72,
            left: 0,
            right: 0,
            textAlign: "center",
            margin: 0,
            fontSize: 18,
            color: C.muted,
            opacity: interpolate(frame, [80, 100], [0, 1], clamp),
          }}
        >
          Cockpit métier
        </p>
      </AbsoluteFill>
    </Stage>
  );
};
