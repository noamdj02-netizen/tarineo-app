import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { AccueilContent } from "../components/AccueilContent";
import { Narration } from "../components/Narration";
import { COPY } from "../data";
import { Grain, HdMascot, ProductShell, Stage } from "../ui";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

export const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 35], [1.08, 1], clamp);
  const reveal = interpolate(frame, [0, 18], [0.4, 1], clamp);
  const progress = interpolate(frame, [0, 42], [0.15, 1], clamp);

  return (
    <Stage>
      <Narration
        pain="Vous ne savez plus par où commencer."
        solution={COPY.dashboardLine}
        start={0}
      />
      <Grain opacity={0.02} />
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 48,
          opacity: reveal,
          transform: `scale(${zoom})`,
        }}
      >
        <ProductShell activeNav="Accueil" width={1380} height={780} padding={18}>
          <AccueilContent progress={progress} />
        </ProductShell>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          right: 48,
          bottom: 24,
          opacity: interpolate(frame, [20, 34], [0, 1], clamp),
        }}
      >
        <HdMascot pose="01-pouce-leve" size={200} />
      </div>
    </Stage>
  );
};
