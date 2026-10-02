import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TarineoLogoMark } from "../../components/TarineoLogoMark";
import { C, SHADOW } from "../constants";
import { COPY } from "../data";
import { Stage, clamp } from "../ui";

/** 16→17s — spinner (ref blue → orange). */
export const SpinnerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const rot = frame * 12;
  const enter = interpolate(frame, [0, 8], [0, 1], clamp);
  const exit = interpolate(frame, [22, 30], [1, 0], clamp);

  return (
    <Stage>
      <AbsoluteFill style={{ display: "grid", placeItems: "center", opacity: enter * exit }}>
        <svg width={56} height={56} viewBox="0 0 56 56" style={{ transform: `rotate(${rot}deg)` }}>
          <circle
            cx="28"
            cy="28"
            r="20"
            fill="none"
            stroke={C.accent}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="80 40"
          />
        </svg>
      </AbsoluteFill>
    </Stage>
  );
};

/** 17→18.5s — « Votre métier, » puis badge. */
export const MakeSimpleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const text = spring({ frame: frame - 2, fps, config: { damping: 16, stiffness: 110 } });
  const badge = spring({ frame: frame - 16, fps, config: { damping: 16, stiffness: 120 } });
  const end = interpolate(frame, [28, 40], [0, 1], clamp);

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
        <span
          style={{
            fontSize: 52,
            fontWeight: 550,
            letterSpacing: "-0.04em",
            color: C.muted,
            opacity: text,
            transform: `translateX(${(1 - text) * -18}px)`,
          }}
        >
          {COPY.makeSimple}
        </span>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: C.white,
            borderRadius: 16,
            padding: "12px 18px",
            boxShadow: SHADOW,
            opacity: badge,
            transform: `scale(${0.9 + badge * 0.1})`,
          }}
        >
          <TarineoLogoMark size={26} variant="light" />
          <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.06em" }}>{COPY.workBadge}</span>
        </div>
        <span
          style={{
            fontSize: 52,
            fontWeight: 550,
            letterSpacing: "-0.04em",
            opacity: end,
            transform: `translateX(${(1 - end) * 14}px)`,
          }}
        >
          {COPY.makeSimpleEnd}
        </span>
      </AbsoluteFill>
    </Stage>
  );
};

/** 18.5→20.5s — badge + « Maintenant. » */
export const StartNowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const badge = spring({ frame, fps, config: { damping: 16, stiffness: 110 } });
  const sub = interpolate(frame, [16, 30], [0, 1], clamp);

  return (
    <Stage>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: C.white,
            borderRadius: 16,
            padding: "12px 18px",
            boxShadow: SHADOW,
            opacity: badge,
            transform: `scale(${0.94 + badge * 0.06})`,
          }}
        >
          <TarineoLogoMark size={26} variant="light" />
          <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.06em" }}>{COPY.workBadge}</span>
        </div>
        <span
          style={{
            fontSize: 42,
            fontWeight: 550,
            letterSpacing: "-0.03em",
            opacity: sub,
            transform: `translateX(${(1 - sub) * 16}px)`,
          }}
        >
          {COPY.startNow}
        </span>
      </AbsoluteFill>
    </Stage>
  );
};

/** 20.5→22.5s — logo + arcs (ref). */
export const LogoArcsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 4, fps, config: { damping: 18, stiffness: 100 } });
  const arc1 = interpolate(frame, [6, 36], [0, 1], clamp);
  const arc2 = interpolate(frame, [14, 44], [0, 1], clamp);

  return (
    <Stage>
      <AbsoluteFill>
        <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
          <path
            d="M 120 200 C 400 80, 700 120, 960 400"
            fill="none"
            stroke={C.ink}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={900}
            strokeDashoffset={900 * (1 - arc1)}
            opacity={0.85}
          />
          <path
            d="M 1800 280 C 1500 500, 1300 700, 1100 820"
            fill="none"
            stroke={C.accent}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={800}
            strokeDashoffset={800 * (1 - arc2)}
            opacity={0.9}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) scale(${0.88 + logo * 0.12})`,
            opacity: logo,
          }}
        >
          <TarineoLogoMark size={64} variant="light" />
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/** 22.5→25s — logo + URL (ref Website.com). */
export const LogoEndScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 2, fps, config: { damping: 18, stiffness: 100 } });
  const url = interpolate(frame, [18, 34], [0, 1], clamp);

  return (
    <Stage>
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            opacity: enter,
            transform: `scale(${0.9 + enter * 0.1}) translateY(${(1 - enter) * 12}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <TarineoLogoMark size={68} variant="light" />
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 550,
            letterSpacing: "-0.02em",
            color: C.ink,
            opacity: url,
            transform: `translateY(${(1 - url) * 8}px)`,
          }}
        >
          {COPY.url}
        </p>
      </AbsoluteFill>
    </Stage>
  );
};
