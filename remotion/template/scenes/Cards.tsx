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
import { PORTRAITS } from "../data";
import { Stage, clamp } from "../ui";

const SIZE = 292;

/** 4.5→7.0s — 3 portraits horizontaux (ref). */
export const PortraitsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Stage>
      {/* soft glow behind */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 40% 35% at 50% 50%, rgba(255,180,120,0.22) 0%, rgba(140,200,160,0.12) 40%, transparent 70%)",
          opacity: interpolate(frame, [0, 16], [0, 1], clamp),
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        {PORTRAITS.map((p, i) => {
          const enter = spring({
            frame: frame - (2 + i * 4),
            fps,
            config: { damping: 16, stiffness: 130 },
          });
          const drift = Math.sin((frame + i * 18) / 20) * 2.5;
          return (
            <div
              key={p.src}
              style={{
                width: SIZE,
                height: SIZE,
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: SHADOW,
                opacity: enter,
                transform: `translateY(${(1 - enter) * 26 + drift}px) scale(${0.92 + enter * 0.08})`,
                background: p.orangeBg ? C.accent : C.white,
                position: "relative",
              }}
            >
              <Img
                src={staticFile(p.src)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  mixBlendMode: p.orangeBg ? "luminosity" : "normal",
                  opacity: p.orangeBg ? 0.85 : 1,
                }}
              />
              {p.orangeBg ? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255,107,26,0.35)",
                    mixBlendMode: "multiply",
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </AbsoluteFill>
    </Stage>
  );
};

/** 7.0→8.5s — mutation : scan / orange métier / sparkle. */
export const MutateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scan = interpolate(frame, [4, 36], [10, 90], clamp);
  const spark = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 110 } });

  return (
    <Stage>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        {/* Left: photo + scan bars */}
        <div
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: SHADOW,
            position: "relative",
            background: C.ink,
          }}
        >
          <Img
            src={staticFile(PORTRAITS[0].src)}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.05)" }}
          />
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${18 + i * 18}%`,
                height: 18,
                background: "rgba(10,30,60,0.45)",
                opacity: interpolate(frame, [6 + i * 3, 14 + i * 3], [0, 1], clamp),
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `${scan}%`,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
              boxShadow: "0 0 12px rgba(255,107,26,0.45)",
            }}
          />
        </div>

        {/* Center: orange métier */}
        <div
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: SHADOW,
            background: C.accent,
            position: "relative",
          }}
        >
          <Img
            src={staticFile(PORTRAITS[1].src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              mixBlendMode: "luminosity",
              opacity: 0.55,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              color: C.white,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.14em", opacity: 0.9 }}>MÉTIER</p>
              <p style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 700 }}>{PORTRAITS[1].label}</p>
            </div>
          </div>
        </div>

        {/* Right: sparkle */}
        <div
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: SHADOW,
            background: C.white,
            position: "relative",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Img
            src={staticFile(PORTRAITS[2].src)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.35,
            }}
          />
          <svg
            width={110}
            height={110}
            viewBox="0 0 120 120"
            style={{
              transform: `scale(${0.55 + spark * 0.45}) rotate(${spark * 18}deg)`,
              opacity: spark,
              zIndex: 2,
            }}
          >
            <path
              d="M60 6 L70 46 L110 60 L70 74 L60 114 L50 74 L10 60 L50 46 Z"
              fill={C.accent}
            />
          </svg>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
