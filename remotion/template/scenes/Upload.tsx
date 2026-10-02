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
import { COPY, PORTRAITS } from "../data";
import { Cursor, Stage, clamp } from "../ui";

/** 10→12.5s — grande carte Upload (ref). */
export const UploadScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });
  const showThumb = interpolate(frame, [28, 42], [0, 1], clamp);
  const cursorX = interpolate(frame, [18, 50], [1240, 1120], clamp);
  const cursorY = interpolate(frame, [18, 50], [720, 640], clamp);

  return (
    <Stage>
      <AbsoluteFill style={{ display: "grid", placeItems: "center" }}>
        <div
          style={{
            width: 1040,
            height: 620,
            background: C.white,
            borderRadius: 28,
            boxShadow: SHADOW,
            opacity: enter,
            transform: `scale(${0.96 + enter * 0.04}) translateY(${(1 - enter) * 20}px)`,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* thumb appears left like ref */}
          <div
            style={{
              position: "absolute",
              left: 48,
              top: "50%",
              transform: `translateY(-50%) scale(${0.9 + showThumb * 0.1})`,
              opacity: showThumb,
              width: 200,
              height: 200,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: SHADOW,
            }}
          >
            <Img
              src={staticFile(PORTRAITS[0].src)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div style={{ textAlign: "center", marginLeft: showThumb * 80 }}>
            <p style={{ margin: 0, fontSize: 36, fontWeight: 550, letterSpacing: "-0.03em" }}>
              {COPY.upload}
            </p>
            <div
              style={{
                marginTop: 28,
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                opacity: interpolate(frame, [12, 24], [0, 1], clamp),
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 48,
                  borderRadius: 10,
                  background: C.accentSoft,
                  border: `1.5px solid rgba(255,107,26,0.35)`,
                  display: "grid",
                  placeItems: "center",
                  color: C.accent,
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                PDF
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>{COPY.uploadFile}</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <Cursor
        x={cursorX}
        y={cursorY}
        opacity={interpolate(frame, [14, 24], [0, 1], clamp)}
      />
    </Stage>
  );
};
