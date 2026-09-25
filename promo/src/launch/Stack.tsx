import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { fontGrotesk } from "../fonts";
import { C } from "../theme";

export const STACK_DURATION = 120;

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const LINES = [
  { name: "Line 1", text: "Un projet.", at: 4 },
  { name: "Line 2", text: "Une action.", at: 18 },
  { name: "Line 3", text: "Un copilote.", at: 32 },
] as const;

export const Stack: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        fontFamily: fontGrotesk,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 150px",
        gap: 8,
      }}
    >
      {LINES.map((line) => (
        <Interactive.Div
          key={line.name}
          name={line.name}
          style={{
            fontSize: 140,
            fontWeight: 700,
            letterSpacing: "-0.05em",
            lineHeight: 0.96,
            color: C.ink,
            opacity: interpolate(frame, [line.at, line.at + 16], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
            }),
            translate: interpolate(frame, [line.at, line.at + 20], ["0px 40px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
            }),
          }}
        >
          {line.text}
        </Interactive.Div>
      ))}
    </AbsoluteFill>
  );
};
