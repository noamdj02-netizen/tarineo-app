import type { CSSProperties, ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ProductFeatureFrame } from "../product-v2/embeds/ProductFeatureFrame";
import { clamp } from "./ui";

type TemplateAppInsetProps = {
  activeNav: string;
  children: ReactNode;
  shellWidth?: number;
  shellHeight?: number;
  shellStyle?: CSSProperties;
  maxWidthRatio?: number;
  maxHeightRatio?: number;
  /** Désactive l’entrée spring (parent anime déjà). */
  skipEnter?: boolean;
};

/**
 * Cadre app Product V2 scalé pour le template 1080p / 4K.
 * Animations via `useCurrentFrame` (pas de CSS transition).
 */
export function TemplateAppInset({
  activeNav,
  children,
  shellWidth = 1320,
  shellHeight = 740,
  shellStyle,
  maxWidthRatio = 0.9,
  maxHeightRatio = 0.84,
  skipEnter = false,
}: TemplateAppInsetProps) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const fit = Math.min((width * maxWidthRatio) / shellWidth, (height * maxHeightRatio) / shellHeight);
  const enter = skipEnter ? 1 : spring({ frame, fps, config: { damping: 18, stiffness: 110 } });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          opacity: skipEnter ? 1 : enter,
          scale: fit * (skipEnter ? 1 : interpolate(enter, [0, 1], [0.94, 1], clamp)),
          translate: skipEnter ? "0 0" : `0 ${interpolate(enter, [0, 1], [24, 0], clamp)}px`,
        }}
      >
        <ProductFeatureFrame
          activeNav={activeNav}
          width={shellWidth}
          height={shellHeight}
          shellStyle={shellStyle}
          skipEnter
        >
          {children}
        </ProductFeatureFrame>
      </div>
    </div>
  );
}

/** Crop zoom sur un panneau (ex. carte gauche Mutate). */
export function TemplateAppCrop({
  activeNav,
  children,
  shellWidth = 1280,
  shellHeight = 700,
  cropWidth,
  cropHeight,
  offsetX = 0,
  offsetY = 0,
}: {
  activeNav: string;
  children: ReactNode;
  shellWidth?: number;
  shellHeight?: number;
  cropWidth: number;
  cropHeight: number;
  offsetX?: number;
  offsetY?: number;
}) {
  const scale = Math.max(cropWidth / shellWidth, cropHeight / shellHeight) * 1.08;

  return (
    <div
      style={{
        width: cropWidth,
        height: cropHeight,
        borderRadius: 18,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: offsetX,
          top: offsetY,
          scale,
          transformOrigin: "top left",
        }}
      >
        <ProductFeatureFrame
          activeNav={activeNav}
          width={shellWidth}
          height={shellHeight}
          skipEnter
        >
          {children}
        </ProductFeatureFrame>
      </div>
    </div>
  );
}
