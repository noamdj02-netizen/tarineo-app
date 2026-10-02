import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { C, SHADOW } from "../constants";
import { ANALYSE_STEPS, CATEGORIES, DOCS } from "../data";
import { Narration } from "../components/Narration";
import { Grain, HdMascot, ProductShell, Reveal, SoftCard, Stage } from "../ui";
import { COPY } from "../data";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

export const AnalyseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const scanY = interpolate(frame, [8, 70], [12, 88], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
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
          <div style={{ display: "flex", gap: 20, height: "100%" }}>
            <SoftCard style={{ width: 380, position: "relative", overflow: "hidden", padding: 20, flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 11, color: C.muted, letterSpacing: "0.1em", fontWeight: 600 }}>
                DOCUMENT
              </p>
              <p style={{ margin: "6px 0 16px", fontSize: 18, fontWeight: 700 }}>FACTURE_FOURNISSEUR.pdf</p>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 12,
                    borderRadius: 6,
                    background: i === 2 || i === 4 ? C.accentSoft : "rgba(10,10,10,0.06)",
                    marginBottom: 10,
                    width: `${68 + (i % 3) * 10}%`,
                  }}
                />
              ))}
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  right: 14,
                  top: `${scanY}%`,
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
                  boxShadow: "0 0 14px rgba(255,107,26,0.3)",
                  opacity: interpolate(frame, [8, 16, 70, 78], [0, 1, 1, 0], clamp),
                }}
              />
            </SoftCard>

            <div style={{ flex: 1, minWidth: 0 }}>
              <Reveal start={4} duration={12}>
                <h2 style={{ margin: "0 0 14px", fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>
                  Analyse en cours...
                </h2>
              </Reveal>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ANALYSE_STEPS.map((step, i) => {
                  const start = 14 + i * 9;
                  const op = interpolate(frame, [start, start + 12], [0, 1], clamp);
                  const x = interpolate(frame, [start, start + 12], [12, 0], clamp);
                  return (
                    <div
                      key={step.text}
                      style={{
                        opacity: op,
                        transform: `translateX(${x}px)`,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: C.white,
                        border: `1px solid ${C.border}`,
                        borderRadius: 12,
                        padding: "10px 12px",
                        boxShadow: SHADOW,
                      }}
                    >
                      <span
                        style={{
                          color: step.ok ? "#16A34A" : C.accent,
                          fontWeight: 700,
                          width: 18,
                          fontSize: 14,
                        }}
                      >
                        {step.ok ? "✓" : "⚠"}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 550 }}>{step.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
