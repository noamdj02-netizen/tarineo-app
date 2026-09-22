import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { AnimatedText } from "./components/AnimatedText";
import { GradientBackground } from "./components/Background";
import { DashboardScene } from "./frames/DashboardScene";
import { AccueilPage } from "./frames/pages/AccueilPage";
import { DevisPage } from "./frames/pages/DevisPage";
import { DocumentDetailPage } from "./frames/pages/DocumentDetailPage";
import { DocumentsPage } from "./frames/pages/DocumentsPage";
import { COLORS, FONT, TOKENS } from "./theme";

const SCENE_FRAMES = 165;
const TRANSITION_FRAMES = 15 + 18 + 15 + 18 + 18 + 20;

export const TARINEO_PROMO_DURATION = SCENE_FRAMES * 7 - TRANSITION_FRAMES;

function LogoMark({ size = 80, delay = 0 }: { size?: number; delay?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 100 } });
  const scale = interpolate(s, [0, 1], [0.5, 1]);

  return (
    <Img
      src={staticFile("logo-mark.png")}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        transform: `scale(${scale})`,
        filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.25))",
      }}
    />
  );
}

function DistributorPills({ delay = 0 }: { delay?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enseignes = ["Cedeo", "Point P", "Rexel", "Brossette", "Richardson", "Aubade"];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 700 }}>
      {enseignes.map((nom, i) => {
        const enter = spring({ frame: frame - delay - i * 4, fps, config: { damping: 16 } });
        const opacity = interpolate(enter, [0, 1], [0, 1]);
        const y = interpolate(enter, [0, 1], [16, 0]);
        return (
          <div
            key={nom}
            style={{
              opacity,
              transform: `translateY(${y}px)`,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 100,
              padding: "8px 18px",
              fontFamily: FONT,
              fontSize: 15,
              fontWeight: 500,
              color: COLORS.white,
              backdropFilter: "blur(8px)",
            }}
          >
            {nom}
          </div>
        );
      })}
    </div>
  );
}

function SceneIntro() {
  return (
    <AbsoluteFill>
      <GradientBackground variant="hero" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80 }}>
        <LogoMark size={96} />
        <div style={{ height: 32 }} />
        <AnimatedText delay={8} size={78}>Tarineo</AnimatedText>
        <div style={{ height: 20 }} />
        <AnimatedText delay={18} size={32} weight={500}>
          Protégez votre marge sur le matériel
        </AnimatedText>
        <div style={{ height: 48 }} />
        <DistributorPills delay={28} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function SceneProblem() {
  return (
    <AbsoluteFill>
      <GradientBackground variant="dark" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 100px" }}>
        <div style={{ display: "flex", gap: 80, alignItems: "center", width: "100%", maxWidth: 1400 }}>
          <div style={{ flex: 1 }}>
            <AnimatedText delay={0} size={52} align="left">
              Les hausses passent inaperçues
            </AnimatedText>
            <div style={{ height: 24 }} />
            <AnimatedText delay={12} size={24} weight={400} align="left" color="rgba(255,255,255,0.75)">
              +3 % sur un chauffe-eau, +5 % sur la tuyauterie… Sur un chantier, ça fait des centaines d&apos;euros de marge en moins.
            </AnimatedText>
          </div>
          <div
            style={{
              flex: "0 0 320px",
              background: COLORS.dangerBg,
              borderRadius: 24,
              padding: 32,
              border: "1px solid #f5c4c4",
            }}
          >
            <div style={{ fontFamily: FONT, fontSize: 14, color: COLORS.muted }}>Impact estimé</div>
            <div style={{ fontFamily: FONT, fontSize: 56, fontWeight: 700, color: COLORS.danger, marginTop: 8 }}>
              −1 240 €
            </div>
            <div style={{ fontFamily: FONT, fontSize: 14, color: COLORS.muted, marginTop: 8 }}>sur 12 mois · historique personnel</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function SceneDocuments() {
  return (
    <DashboardScene
      title="Importez vos devis fournisseurs"
      subtitle="Photo, PDF ou transfert email — quota et suivi en un coup d'œil"
      delay={6}
    >
      <DocumentsPage />
    </DashboardScene>
  );
}

function SceneAnalyse() {
  return (
    <DashboardScene
      title="Chaque prix comparé à VOS achats"
      subtitle="Alertes de hausse et impact total sur le document"
      delay={6}
    >
      <DocumentDetailPage />
    </DashboardScene>
  );
}

function SceneAccueil() {
  return (
    <DashboardScene
      title="Tableau de bord, fournisseurs, alertes"
      subtitle="Vue d'ensemble de vos dépenses et hausses détectées"
      delay={6}
    >
      <AccueilPage />
    </DashboardScene>
  );
}

function SceneDevis() {
  return (
    <DashboardScene
      title="Devis clients professionnels"
      subtitle="Création, suivi et transformation en facture"
      delay={6}
    >
      <DevisPage />
    </DashboardScene>
  );
}

function SceneOutro() {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 8) * 0.02;

  return (
    <AbsoluteFill>
      <GradientBackground variant="hero" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <LogoMark size={88} delay={0} />
        <div style={{ height: 28 }} />
        <AnimatedText delay={6} size={64}>Essai gratuit</AnimatedText>
        <div style={{ height: 16 }} />
        <AnimatedText delay={14} size={28} weight={500}>
          tarineo.com — Vérifiez votre premier devis
        </AnimatedText>
        <div style={{ height: 40 }} />
        <div
          style={{
            transform: `scale(${pulse})`,
            background: COLORS.white,
            color: TOKENS.primary,
            fontFamily: FONT,
            fontSize: 20,
            fontWeight: 700,
            padding: "16px 40px",
            borderRadius: 100,
            boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
          }}
        >
          Commencer maintenant →
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export function TarineoPromo() {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
        <SceneIntro />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
        <SceneProblem />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 18 })} />
      <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
        <SceneDocuments />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
        <SceneAnalyse />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: 18 })} />
      <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
        <SceneAccueil />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 18 })} />
      <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
        <SceneDevis />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />
      <TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
        <SceneOutro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
}
