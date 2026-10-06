import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { C, SHADOW } from "../../product-v2/constants";
import { ANALYSE_STEPS } from "../../product-v2/data";
import { fontSans } from "../../fonts";
import { DevisDocMock } from "./DevisDocMock";
import { DEVIS_SAMPLES } from "../data";
import { clamp } from "../ui";

const easeClamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

/** Scan + étapes sur le devis Cedeo (timeline locale à la Sequence parente). */
export function DevisFullAnalyseView() {
  const frame = useCurrentFrame();
  const scanY = interpolate(frame, [4, 72], [8, 92], easeClamp);
  const scanOpacity = interpolate(frame, [4, 10, 72, 82], [0, 1, 1, 0.35], easeClamp);

  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        height: "100%",
        fontFamily: fontSans,
        padding: 10,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${C.border}`,
          position: "relative",
        }}
      >
        <DevisDocMock sample={DEVIS_SAMPLES[0]} scanPercent={scanY} />
        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 12,
            padding: "8px 10px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.92)",
            border: `1px solid ${C.border}`,
            fontSize: 11,
            fontWeight: 600,
            color: C.muted,
            opacity: scanOpacity,
          }}
        >
          Lecture ligne par ligne…
        </div>
      </div>

      <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em" }}>Analyse en cours</p>
        {ANALYSE_STEPS.map((step, i) => {
          const start = 10 + i * 10;
          const op = interpolate(frame, [start, start + 10], [0, 1], easeClamp);
          const x = interpolate(frame, [start, start + 10], [10, 0], easeClamp);
          const done = frame >= start + 8;
          return (
            <div
              key={step.text}
              style={{
                opacity: op,
                transform: `translateX(${x}px)`,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "8px 10px",
                boxShadow: SHADOW,
                fontSize: 12,
                fontWeight: done ? 600 : 500,
              }}
            >
              <span style={{ color: done ? "#16A34A" : C.accent, fontWeight: 700 }}>{done ? "✓" : "·"}</span>
              {step.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
