import { AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame } from "remotion";
import { fontGrotesk } from "../fonts";
import { C, SHADOW_LIFT } from "../theme";
import { Sfx } from "./Sfx";

export { APPS_DURATION } from "./timeline";

const ease = Easing.bezier(0.16, 1, 0.3, 1);
/** Derniers mots de la voix : « utilise Navpit ». */
const SWITCH = 136;
const TILE = 86;
const CX = 540;
const CY = 960;

const ICONS: { file: string; name: string; x: number; y: number; rot: number; delay: number; size?: number }[] = [
  { file: "notion.svg", name: "Notion", x: 40, y: 160, rot: -7, delay: 0 },
  { file: "figma.svg", name: "Figma", x: 190, y: 120, rot: 5, delay: 2 },
  { file: "cursor.svg", name: "Cursor", x: 800, y: 130, rot: -4, delay: 4 },
  { file: "github.svg", name: "GitHub", x: 940, y: 200, rot: 6, delay: 1 },
  { file: "claude.svg", name: "Claude", x: 36, y: 320, rot: -5, delay: 3 },
  { file: "chatgpt.png", name: "ChatGPT", x: 948, y: 340, rot: 4, delay: 5 },
  { file: "excalidraw.svg", name: "Excalidraw", x: 40, y: 480, rot: -6, delay: 2 },
  { file: "vercel.svg", name: "Vercel", x: 948, y: 500, rot: 7, delay: 6 },
  { file: "supabase.svg", name: "Supabase", x: 36, y: 640, rot: 5, delay: 4 },
  { file: "stripe.svg", name: "Stripe", x: 948, y: 660, rot: -3, delay: 7 },
  { file: "canva.jpg", name: "Canva", x: 40, y: 1220, rot: 4, delay: 5 },
  { file: "gamma.jpg", name: "Gamma", x: 948, y: 1240, rot: -8, delay: 8 },
  { file: "gmail.svg", name: "Gmail", x: 48, y: 1380, rot: -6, delay: 6 },
  { file: "google-drive.svg", name: "Drive", x: 940, y: 1400, rot: 5, delay: 9 },
  { file: "linkedin.png", name: "LinkedIn", x: 40, y: 1540, rot: 4, delay: 8 },
  { file: "instagram.svg", name: "Instagram", x: 200, y: 1620, rot: -7, delay: 10 },
  { file: "tiktok.svg", name: "TikTok", x: 800, y: 1620, rot: 6, delay: 7 },
  { file: "apple-calendar.svg", name: "Calendrier", x: 940, y: 1540, rot: -4, delay: 11 },
  { file: "notion.svg", name: "Notion 2", x: 360, y: 1680, rot: 8, delay: 9, size: 68 },
  { file: "figma.svg", name: "Figma 2", x: 640, y: 1688, rot: -5, delay: 12, size: 68 },
];

const line = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, start + 10, end, end + 8], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

/** Les apps déjà dans Navpit, puis la phrase qui dit de les remplacer. */
export const Apps: React.FC = () => {
  const frame = useCurrentFrame();
  const spread = interpolate(frame, [SWITCH, SWITCH + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: fontGrotesk }}>
      <Sfx file="sfx-pop.mp3" at={2} frames={8} volume={0.34} />
      <Sfx file="sfx-pop.mp3" at={8} frames={8} volume={0.28} />
      <Sfx file="sfx-pop.mp3" at={14} frames={8} volume={0.24} />
      <Sfx file="sfx-whoosh.mp3" at={130} frames={16} volume={0.22} />
      {ICONS.map((icon) => {
        const local = frame - icon.delay * 2;
        const tile = icon.size ?? TILE;
        const cx = icon.x + tile / 2 - CX;
        const cy = icon.y + tile / 2 - CY;
        return (
          <Interactive.Div
            key={icon.name}
            name={icon.name}
            style={{
              position: "absolute",
              left: icon.x,
              top: icon.y,
              width: tile,
              height: tile,
              borderRadius: tile * 0.26,
              backgroundColor: C.surface,
              boxShadow: SHADOW_LIFT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: interpolate(local, [0, 10], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }) * interpolate(frame, [SWITCH, SWITCH + 14], [1, 0.72], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              scale: interpolate(local, [0, 14], [0.7, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: ease,
                output: "perceptual-scale",
              }),
              rotate: `${icon.rot}deg`,
              translate: `${cx * spread * 0.1}px ${cy * spread * 0.1 + Math.sin((frame + icon.delay * 9) / 18) * 5}px`,
            }}
          >
            <Img
              src={staticFile(`brands/${icon.file}`)}
              style={{ width: tile * 0.5, height: tile * 0.5, objectFit: "contain" }}
            />
          </Interactive.Div>
        );
      })}

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: line(frame, 18, SWITCH - 14),
        }}
      >
        <Interactive.Div
          name="Fenêtres"
          style={{
            padding: "22px 32px",
            borderRadius: 999,
            backgroundColor: C.surface,
            boxShadow: SHADOW_LIFT,
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            color: C.ink,
            textAlign: "center",
            translate: interpolate(frame, [18, 32], ["0px 18px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: ease,
            }),
          }}
        >
          Toutes ces fenêtres.
        </Interactive.Div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: interpolate(frame, [SWITCH, SWITCH + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
          }),
          scale: interpolate(frame, [SWITCH, SWITCH + 16], [0.92, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: ease,
            output: "perceptual-scale",
          }),
        }}
      >
        <Interactive.Div
          name="Navpit"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            padding: "18px 28px 22px",
            borderRadius: 32,
            backgroundColor: C.surface,
            boxShadow: SHADOW_LIFT,
          }}
        >
          <Img
            src={staticFile("logo.png")}
            style={{ height: 110, width: "auto", objectFit: "contain", backgroundColor: "transparent" }}
          />
          <span style={{ fontSize: 52, fontWeight: 700, letterSpacing: "-0.04em", color: C.ink }}>
            Utilise Navpit.
          </span>
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
