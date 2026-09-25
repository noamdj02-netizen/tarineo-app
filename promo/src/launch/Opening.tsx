import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { fontGrotesk, fontMono } from "../fonts";
import { C, SHADOW_LIFT } from "../theme";
import { Mesh } from "./Mesh";
import { Sfx } from "./Sfx";

export { OPENING_DURATION } from "./timeline";

const spring = Easing.spring({ damping: 18, stiffness: 170, mass: 0.55 });
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const PITCH = 88;
const HIT = 2;

const ROWS = [
  { name: "Café Nord", stage: "Valider" },
  { name: "Plume", stage: "MVP" },
  { name: "Maison Claire", stage: "Bêta" },
  { name: "Kiosque", stage: "1ère vente" },
  { name: "Tempo", stage: "Pause" },
] as const;

/** La sélection glisse de projet en projet, puis se pose sur Maison Claire. */
export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const query =
    frame < 8
      ? ""
      : frame < 14
        ? ROWS[0].name
        : frame < 24
          ? ROWS[1].name
          : frame < 34
            ? ROWS[3].name
            : frame < 46
              ? ROWS[4].name
              : ROWS[HIT].name;
  const locked = interpolate(frame, [54, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: spring,
  });

  return (
    <AbsoluteFill style={{ fontFamily: fontGrotesk }}>
      <Mesh />
      <Sfx file="sfx-pop.mp3" at={2} frames={8} volume={0.4} />
      <Sfx file="sfx-tick.mp3" at={12} frames={6} volume={0.32} />
      <Sfx file="sfx-tick.mp3" at={22} frames={6} volume={0.32} />
      <Sfx file="sfx-tick.mp3" at={32} frames={6} volume={0.32} />
      <Sfx file="sfx-tick.mp3" at={42} frames={6} volume={0.32} />
      <Sfx file="sfx-whoosh.mp3" at={50} frames={16} volume={0.26} />
      <Sfx file="sfx-lock.mp3" at={56} frames={18} volume={0.4} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Interactive.Div
          name="Recherche"
          style={{
            width: 960,
            borderRadius: 28,
            backgroundColor: C.surface,
            boxShadow: SHADOW_LIFT,
            overflow: "hidden",
            opacity: interpolate(frame, [0, 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [0, 20], [0.94, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: spring,
              output: "perceptual-scale",
            }),
            translate: interpolate(frame, [0, 20], ["0px 32px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: spring,
            }),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              height: 84,
              padding: "0 28px",
              borderBottom: `1px solid ${C.line}`,
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="6.5" stroke={C.ink} strokeWidth="1.8" />
              <path d="M16 16.5L20 20.5" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span
              style={{
                fontSize: 34,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: query ? C.ink : C.muted,
              }}
            >
              {query || "Chercher un projet"}
            </span>
            <span
              style={{
                width: 2,
                height: 32,
                borderRadius: 2,
                backgroundColor: C.ink,
                opacity: frame % 16 < 9 ? 0.9 : 0,
              }}
            />
          </div>
          <div style={{ position: "relative", height: ROWS.length * PITCH + 16, padding: "8px 10px" }}>
            <div
              style={{
                position: "absolute",
                left: 10,
                right: 10,
                top: 8,
                height: PITCH - 8,
                borderRadius: 16,
                backgroundColor: "#f4f4f3",
                opacity: 1 - locked,
                translate: interpolate(
                  frame,
                  [0, 12, 22, 32, 42, 54],
                  ["0px 0px", "0px 0px", `0px ${PITCH}px`, `0px ${PITCH * 3}px`, `0px ${PITCH * 4}px`, `0px ${PITCH * HIT}px`],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: ease,
                  },
                ),
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 10,
                right: 10,
                top: 8,
                height: PITCH - 8,
                borderRadius: 16,
                background: "linear-gradient(98deg, #f7c6a3 0%, #cbbdf3 48%, #b3cbf6 100%)",
                opacity: locked,
                translate: `0px ${PITCH * HIT}px`,
                scale: interpolate(frame, [54, 72], [0.96, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: spring,
                  output: "perceptual-scale",
                }),
              }}
            />
            {ROWS.map((row, i) => (
              <div
                key={row.name}
                style={{
                  position: "relative",
                  zIndex: 1,
                  height: PITCH,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 22px",
                  opacity: interpolate(frame, [50, 68], [1, i === HIT ? 1 : 0.28], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                  filter: `blur(${interpolate(frame, [52, 70], [0, i === HIT ? 0 : 3], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })}px)`,
                  translate: interpolate(frame, [52, 72], ["0px 0px", i === HIT ? "0px 0px" : "0px 10px"], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: spring,
                  }),
                }}
              >
                <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.03em", color: C.ink }}>{row.name}</span>
                <span
                  style={{
                    fontFamily: fontMono,
                    fontSize: 16,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: i === HIT ? C.ink : C.muted,
                    opacity: i === HIT ? 1 - locked * 0.15 : 1,
                  }}
                >
                  {i === HIT && frame >= 58 ? "En Focus" : row.stage}
                </span>
              </div>
            ))}
          </div>
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
