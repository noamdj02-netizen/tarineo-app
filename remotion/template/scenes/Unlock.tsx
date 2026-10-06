import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnalysePanel } from "../../product-v2/embeds/AnalysePanel";
import { COPY } from "../data";
import { TemplateAppInset } from "../TemplateAppInset";
import { PillLogoBtn } from "../components/PillLogoBtn";
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
              <PillLogoBtn />
              <span style={{ fontSize: 21, fontWeight: 550, letterSpacing: "-0.02em" }}>{COPY.unlock}</span>
            </div>
            <RoundBtn dark>→</RoundBtn>
          </PillBar>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/** 2.5→4.5s — analyse IA (écran app) + pill. */
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
            position: "relative",
            width: "100%",
            height: "100%",
            opacity: win,
            scale: interpolate(win, [0, 1], [0.96, 1], clamp),
          }}
        >
          <TemplateAppInset
            activeNav="Analyse IA"
            shellWidth={1280}
            shellHeight={700}
            maxWidthRatio={0.88}
            maxHeightRatio={0.78}
            skipEnter
          >
            <AnalysePanel />
          </TemplateAppInset>

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) scale(${press})`,
              zIndex: 20,
              pointerEvents: "none",
            }}
          >
            <PillBar width={460}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <PillLogoBtn />
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
