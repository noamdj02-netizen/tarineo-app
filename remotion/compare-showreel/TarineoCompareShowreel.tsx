/**
 * Sandbox motion (hors base canonique `TarineoTemplate-4K`).
 * Brief (adapté du prompt « Pinterest Ads vs Meta Ads ») :
 * Showreel comparatif premium — **Tableur & mails** vs **TARINEO**.
 * Kinetic type, data animée, UI produit, zooms, SFX + bed synchronisés, rythme campagne pub.
 * Direction : ivoire éditorial + orange marque, refs Stripe / Linear / Framer craft.
 */
import { AbsoluteFill, Series } from "remotion";
import "./fonts";
import { CompareSoundtrack } from "./Soundtrack";
import { SEQ } from "./constants";
import { fontSans } from "./fonts";
import { HookScene } from "./scenes/HookScene";
import { VsIntroScene } from "./scenes/VsIntroScene";
import { RoundDetectionScene } from "./scenes/RoundDetectionScene";
import { RoundTimeScene } from "./scenes/RoundTimeScene";
import { RoundMarginScene } from "./scenes/RoundMarginScene";
import { MontageUiScene } from "./scenes/MontageUiScene";
import { WinnerScene } from "./scenes/WinnerScene";
import { OutroScene } from "./scenes/OutroScene";

export const TarineoCompareShowreel: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: fontSans }}>
      <CompareSoundtrack />
      <Series>
        <Series.Sequence name="Hook" durationInFrames={SEQ.hook}>
          <HookScene />
        </Series.Sequence>
        <Series.Sequence name="VS Intro" durationInFrames={SEQ.vsIntro}>
          <VsIntroScene />
        </Series.Sequence>
        <Series.Sequence name="Détection" durationInFrames={SEQ.roundDetection}>
          <RoundDetectionScene />
        </Series.Sequence>
        <Series.Sequence name="Temps" durationInFrames={SEQ.roundTime}>
          <RoundTimeScene />
        </Series.Sequence>
        <Series.Sequence name="Marge" durationInFrames={SEQ.roundMargin}>
          <RoundMarginScene />
        </Series.Sequence>
        <Series.Sequence name="Montage UI" durationInFrames={SEQ.montageUi}>
          <MontageUiScene />
        </Series.Sequence>
        <Series.Sequence name="Gagnant" durationInFrames={SEQ.winner}>
          <WinnerScene />
        </Series.Sequence>
        <Series.Sequence name="Outro" durationInFrames={SEQ.outro}>
          <OutroScene />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
