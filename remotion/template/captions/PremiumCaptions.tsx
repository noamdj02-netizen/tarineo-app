import { createTikTokStyleCaptions, type TikTokPage } from "@remotion/captions";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { useMemo } from "react";
import { fontSans } from "../../fonts";
import { C } from "../constants";
import { TEMPLATE_CAPTIONS } from "./captions";

const SWITCH_MS = 1600;

/** Captions premium — bas d’écran, highlight orange sur le mot actif. */
export const PremiumCaptions: React.FC = () => {
  const { fps } = useVideoConfig();

  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions: TEMPLATE_CAPTIONS,
        combineTokensWithinMilliseconds: SWITCH_MS,
      }),
    [],
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {pages.map((page, index) => {
        const next = pages[index + 1] ?? null;
        const startFrame = (page.startMs / 1000) * fps;
        const endFrame = Math.min(
          next ? (next.startMs / 1000) * fps : Infinity,
          startFrame + (SWITCH_MS / 1000) * fps,
        );
        const durationInFrames = Math.ceil(endFrame - startFrame);
        if (durationInFrames <= 0) return null;

        return (
          <Sequence key={index} from={Math.round(startFrame)} durationInFrames={durationInFrames}>
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const absoluteTimeMs = page.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 72,
      }}
    >
      <div
        style={{
          fontFamily: fontSans,
          fontSize: 36,
          fontWeight: 650,
          letterSpacing: "-0.03em",
          whiteSpace: "pre",
          padding: "12px 22px",
          borderRadius: 14,
          background: "rgba(245,245,243,0.82)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 0 0 1px rgba(10,10,10,0.05), 0 8px 24px rgba(10,10,10,0.06)",
        }}
      >
        {page.tokens.map((token, i) => {
          const active = token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
          return (
            <span
              key={`${token.fromMs}-${i}`}
              style={{
                color: active ? C.accent : C.ink,
                transition: "color 80ms linear",
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
