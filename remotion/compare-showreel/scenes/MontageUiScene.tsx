import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { ShowreelAtmosphere } from "../components/ShowreelAtmosphere";
import { MONTAGE_CLIP_COUNT, MONTAGE_CLIP_FRAMES } from "../constants";
import { MONTAGE_CLIPS, ProductClipMontage } from "../product-clips";
import { THEME } from "../constants";
import { fontDisplay, fontMono } from "../fonts";

export const MONTAGE_UI_DURATION = MONTAGE_CLIP_FRAMES * MONTAGE_CLIP_COUNT;

export const MontageUiScene: React.FC = () => {
  const frame = useCurrentFrame();
  const clipIndex = Math.min(
    MONTAGE_CLIPS.length - 1,
    Math.floor(frame / MONTAGE_CLIP_FRAMES),
  );
  const clip = MONTAGE_CLIPS[clipIndex];
  const local = frame % MONTAGE_CLIP_FRAMES;
  const fade = interpolate(local, [0, 8, MONTAGE_CLIP_FRAMES - 10, MONTAGE_CLIP_FRAMES], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  return (
    <AbsoluteFill>
      <ShowreelAtmosphere accent="orange" />
      <AbsoluteFill style={{ padding: "56px 72px 64px", opacity: fade }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontFamily: fontMono, fontSize: 13, color: THEME.muted }}>
            Round 04 · Produit réel · {clipIndex + 1}/{MONTAGE_CLIPS.length}
          </p>
          <p
            style={{
              margin: 0,
              fontFamily: fontDisplay,
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            {clip.label}
          </p>
        </div>

        <div
          style={{
            marginTop: 28,
            height: "calc(100% - 48px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ProductClipMontage clipIndex={clipIndex} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
