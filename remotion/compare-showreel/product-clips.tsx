import type { CSSProperties, ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE } from "../animations";
import { AccueilPanel } from "../product-v2/embeds/AccueilPanel";
import { AnalysePanel } from "../product-v2/embeds/AnalysePanel";
import { ComparateurPanel } from "../product-v2/embeds/ComparateurPanel";
import { CopilotePanel } from "../product-v2/embeds/CopilotePanel";
import { ExportPanel } from "../product-v2/embeds/ExportPanel";
import { HaussesPanel } from "../product-v2/embeds/HaussesPanel";
import { ProductFeatureFrame } from "../product-v2/embeds/ProductFeatureFrame";
import { UploadPanel } from "../product-v2/embeds/UploadPanel";
import { MONTAGE_CLIP_FRAMES } from "./constants";

export const MONTAGE_CLIPS: {
  id: string;
  label: string;
  nav: string;
  shellStyle?: CSSProperties;
  render: () => ReactNode;
}[] = [
  {
    id: "accueil",
    label: "Accueil",
    nav: "Accueil",
    render: () => <AccueilPanel progress={0.85} />,
  },
  {
    id: "hausses",
    label: "Hausses",
    nav: "Hausses",
    render: () => <HaussesPanel />,
  },
  {
    id: "analyse",
    label: "Analyse IA",
    nav: "Analyse IA",
    render: () => <AnalysePanel />,
  },
  {
    id: "upload",
    label: "Import",
    nav: "Analyse IA",
    render: () => <UploadPanel />,
  },
  {
    id: "copilote",
    label: "Copilote",
    nav: "Accueil",
    shellStyle: { position: "relative" },
    render: () => <CopilotePanel />,
  },
  {
    id: "comparateur",
    label: "Comparateur",
    nav: "Comparateur",
    render: () => <ComparateurPanel />,
  },
  {
    id: "export",
    label: "Export comptable",
    nav: "Export comptable",
    render: () => <ExportPanel />,
  },
];

export function ProductClipMontage({ clipIndex }: { clipIndex: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clip = MONTAGE_CLIPS[clipIndex % MONTAGE_CLIPS.length];
  const punch = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 220 },
  });
  const scale = interpolate(punch, [0, 1], [1.08, 1], { easing: EASE });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        transform: `scale(${scale})`,
      }}
    >
      <ProductFeatureFrame
        activeNav={clip.nav}
        width={1580}
        height={900}
        shellStyle={clip.shellStyle}
      >
        {clip.render()}
      </ProductFeatureFrame>
    </div>
  );
}

export function ProductClipSingle({
  nav,
  children,
}: {
  nav: string;
  children: ReactNode;
}) {
  return (
    <ProductFeatureFrame activeNav={nav} width={1500} height={860}>
      {children}
    </ProductFeatureFrame>
  );
}
