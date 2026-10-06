import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { THEME } from "../constants";

export const ShowreelAtmosphere: React.FC<{ accent?: "neutral" | "orange" | "excel" }> = ({
  accent = "neutral",
}) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 900], [0, 1], {
    extrapolateRight: "extend",
  });

  const orange =
    accent === "orange"
      ? "radial-gradient(ellipse 55% 45% at 72% 38%, rgba(255,107,26,0.22), transparent 68%)"
      : accent === "excel"
        ? "radial-gradient(ellipse 50% 40% at 28% 42%, rgba(29,111,66,0.12), transparent 70%)"
        : "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255,107,26,0.08), transparent 65%)";

  return (
    <>
      <AbsoluteFill style={{ backgroundColor: THEME.canvas }} />
      <AbsoluteFill style={{ background: orange, pointerEvents: "none" }} />
      <AbsoluteFill
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(10,10,10,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(10,10,10,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          backgroundPosition: `${drift * 32}px ${drift * 18}px`,
          opacity: 0.55,
          pointerEvents: "none",
        }}
      />
    </>
  );
};
