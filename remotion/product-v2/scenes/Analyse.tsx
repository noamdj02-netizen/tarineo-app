import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { C, SHADOW } from "../constants";
import { CATEGORIES, DOCS } from "../data";
import { AnalysePanel } from "../embeds/AnalysePanel";
import { Narration } from "../components/Narration";
import { Grain, HdMascot, ProductShell, Stage } from "../ui";
import { COPY } from "../data";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

export const AnalyseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const sort = interpolate(frame, [78, 110], [0, 1], clamp);

  return (
    <Stage>
      <Grain />
      <Narration pain={COPY.analysePain} solution={COPY.analyseLine} start={0} />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          paddingTop: 40,
        }}
      >
        <ProductShell activeNav="Analyse IA" width={1280} height={700} padding={14}>
          <AnalysePanel />
        </ProductShell>

        <HdMascot
          pose="09-devis-valide"
          size={160}
          style={{
            position: "absolute",
            right: 48,
            bottom: 28,
            opacity: interpolate(frame, [40, 55], [0, 1], clamp),
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            opacity: interpolate(frame, [58, 72], [0, 1], clamp),
          }}
        >
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat}
              style={{
                minWidth: 140,
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "10px 12px",
                textAlign: "center",
                boxShadow: SHADOW,
                transform: `translateY(${interpolate(sort, [0, 1], [16, 0], clamp)}px)`,
              }}
            >
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: "0.08em" }}>
                {cat}
              </p>
              <div
                style={{
                  marginTop: 8,
                  height: 32,
                  borderRadius: 8,
                  background: C.canvas,
                  border: `1px solid ${C.border}`,
                  opacity: interpolate(frame, [82 + i * 4, 94 + i * 4], [0, 1], clamp),
                  fontSize: 10,
                  display: "grid",
                  placeItems: "center",
                  color: C.muted,
                  padding: "0 6px",
                }}
              >
                {DOCS[i]?.name ?? `${cat}.pdf`}
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
