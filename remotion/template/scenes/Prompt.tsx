import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, SHADOW } from "../constants";
import { COPY, PROMPT_THUMBS } from "../data";
import { Cursor, Stage, clamp } from "../ui";

/** 12.5→16s — carte prompt Copilote (ref). */
export const PromptScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });
  const typed = Math.floor(
    interpolate(frame, [18, 70], [0, COPY.prompt.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const text = COPY.prompt.slice(0, typed);
  const cursorX = interpolate(frame, [82, 98], [1220, 1288], clamp);
  const cursorY = interpolate(frame, [82, 98], [720, 668], clamp);
  const press = interpolate(frame, [98, 104], [1, 0.9], clamp);

  return (
    <Stage>
      <AbsoluteFill style={{ display: "grid", placeItems: "center" }}>
        <div
          style={{
            width: 760,
            background: C.white,
            borderRadius: 28,
            boxShadow: SHADOW,
            padding: "22px 26px 20px",
            opacity: enter,
            transform: `translateY(${(1 - enter) * 22}px) scale(${0.97 + enter * 0.03})`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ fontSize: 20, color: C.muted }}>←</span>
            <span style={{ fontSize: 18, color: C.muted }}>×</span>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {PROMPT_THUMBS.map((t, i) => {
              const op = interpolate(frame, [4 + i * 4, 12 + i * 4], [0, 1], clamp);
              return (
                <div
                  key={t.src}
                  style={{
                    width: 128,
                    height: 128,
                    borderRadius: 14,
                    overflow: "hidden",
                    position: "relative",
                    opacity: op,
                    transform: `scale(${0.9 + op * 0.1})`,
                    boxShadow: SHADOW,
                  }}
                >
                  <Img src={staticFile(t.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      left: 6,
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: C.white,
                      background: "rgba(10,10,10,0.55)",
                      padding: "3px 6px",
                      borderRadius: 6,
                    }}
                  >
                    {t.kind}
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 18,
                      height: 18,
                      borderRadius: 99,
                      background: "rgba(255,255,255,0.85)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 10,
                      color: C.muted,
                    }}
                  >
                    ×
                  </span>
                </div>
              );
            })}
          </div>

          <p
            style={{
              margin: 0,
              minHeight: 108,
              fontSize: 18,
              lineHeight: 1.45,
              letterSpacing: "-0.015em",
              whiteSpace: "pre-wrap",
            }}
          >
            {text}
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: 17,
                background: C.accent,
                marginLeft: 2,
                verticalAlign: "middle",
                opacity: typed < COPY.prompt.length ? (Math.floor(frame / 8) % 2 ? 1 : 0) : 0,
              }}
            />
          </p>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                display: "grid",
                placeItems: "center",
                color: C.muted,
                fontSize: 18,
              }}
            >
              +
            </span>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                background: C.accent,
                color: C.white,
                display: "grid",
                placeItems: "center",
                fontSize: 20,
                fontWeight: 600,
                transform: `scale(${press})`,
                boxShadow: "0 8px 20px rgba(255,107,26,0.35)",
              }}
            >
              →
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <Cursor x={cursorX} y={cursorY} opacity={interpolate(frame, [78, 88], [0, 1], clamp)} />
    </Stage>
  );
};
