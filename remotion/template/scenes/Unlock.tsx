import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C } from "../constants";
import { COPY, HERO_POSTER, HERO_VIDEO } from "../data";
import { Cursor, GuideCross, PillBar, RoundBtn, Stage, clamp } from "../ui";

/** 1.5→2.5s — pill seule + grilles. */
export const UnlockScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 2, fps, config: { damping: 18, stiffness: 120 } });

  return (
    <Stage>
      <GuideCross opacity={0.4} />
      <AbsoluteFill style={{ display: "grid", placeItems: "center" }}>
        <div
          style={{
            opacity: enter,
            transform: `scale(${0.94 + enter * 0.06}) translateY(${(1 - enter) * 14}px)`,
          }}
        >
          <PillBar width={480}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <RoundBtn>+</RoundBtn>
              <span style={{ fontSize: 21, fontWeight: 550, letterSpacing: "-0.02em" }}>{COPY.unlock}</span>
            </div>
            <RoundBtn dark>→</RoundBtn>
          </PillBar>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/** 2.5→4.5s — même pill sur fenêtre vidéo chantier + curseur. */
export const UnlockVideoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const win = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });
  const cursorX = interpolate(frame, [20, 48], [1280, 1110], clamp);
  const cursorY = interpolate(frame, [20, 48], [700, 555], clamp);
  const press = interpolate(frame, [50, 58], [1, 0.94], clamp);

  return (
    <Stage>
      <GuideCross opacity={0.28} />
      <AbsoluteFill style={{ display: "grid", placeItems: "center" }}>
        <div
          style={{
            width: 980,
            height: 552,
            borderRadius: 4,
            overflow: "hidden",
            border: `1px solid rgba(10,10,10,0.2)`,
            boxShadow: "0 24px 64px rgba(10,10,10,0.18)",
            opacity: win,
            transform: `scale(${0.96 + win * 0.04})`,
            position: "relative",
            background: C.ink,
          }}
        >
          <OffthreadVideo
            src={staticFile(HERO_VIDEO)}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.92 }}
          />
          {/* fallback poster if video fails mid-still */}
          <Img
            src={staticFile(HERO_POSTER)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0,
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) scale(${press})`,
            }}
          >
            <PillBar width={460}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <RoundBtn>+</RoundBtn>
                <span style={{ fontSize: 20, fontWeight: 550 }}>{COPY.unlock}</span>
              </div>
              <RoundBtn dark>→</RoundBtn>
            </PillBar>
          </div>
        </div>
      </AbsoluteFill>
      <Cursor x={cursorX} y={cursorY} opacity={interpolate(frame, [14, 24], [0, 1], clamp)} />
    </Stage>
  );
};
