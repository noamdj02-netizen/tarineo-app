import { interpolate, Sequence, useCurrentFrame } from "remotion";
import { DevisFullAnalyseView } from "./DevisFullAnalyseView";
import { C, SHADOW } from "../../product-v2/constants";
import { ANALYSE_STEPS } from "../../product-v2/data";
import { fontSans } from "../../fonts";
import { DevisDocMock } from "./DevisDocMock";
import { COPY as TEMPLATE_COPY } from "../data";
import { DEVIS_SAMPLES } from "../data";
import { HdMascot } from "../../product-v2/ui";
import { clamp } from "../ui";

const USER_PROMPT = "Analyse ce devis fournisseur ligne par ligne.";

/** Copilote + analyse IA visible sur tout le document (~15 s dans la timeline). */
export function CopiloteDevisAnalysePanel() {
  const frame = useCurrentFrame();
  const typed = Math.floor(
    interpolate(frame, [6, 28], [0, USER_PROMPT.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const analyseStart = 20;
  const activeStep = Math.min(
    ANALYSE_STEPS.length - 1,
    Math.floor(interpolate(frame, [analyseStart + 8, analyseStart + 78], [0, ANALYSE_STEPS.length], clamp)),
  );

  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        height: "100%",
        minHeight: 520,
        fontFamily: fontSans,
      }}
    >
      <div
        style={{
          flex: 1.12,
          minWidth: 0,
          borderRadius: 14,
          border: `1px solid ${C.border}`,
          overflow: "hidden",
          background: C.white,
          position: "relative",
        }}
      >
        {frame < analyseStart ? (
          <DevisDocMock sample={DEVIS_SAMPLES[0]} />
        ) : (
          <Sequence from={analyseStart} layout="none">
            <DevisFullAnalyseView />
          </Sequence>
        )}
      </div>

      <div
        style={{
          width: 360,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${C.border}`,
            background: C.white,
            boxShadow: SHADOW,
            overflow: "hidden",
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 14px",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <HdMascot pose="07-ordinateur" size={36} />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Assistant TARINEO</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>Analyse de devis</p>
            </div>
          </header>

          <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                alignSelf: "flex-end",
                maxWidth: "92%",
                padding: "10px 12px",
                borderRadius: 12,
                background: C.canvas,
                fontSize: 13,
                lineHeight: 1.45,
                opacity: interpolate(frame, [4, 10], [0, 1], clamp),
              }}
            >
              {USER_PROMPT.slice(0, typed)}
            </div>

            <div
              style={{
                alignSelf: "flex-start",
                maxWidth: "96%",
                padding: "10px 12px",
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                fontSize: 13,
                lineHeight: 1.45,
                opacity: interpolate(frame, [analyseStart, analyseStart + 10], [0, 1], clamp),
              }}
            >
              {frame < analyseStart + 12
                ? "Je parcours le PDF…"
                : frame < analyseStart + 70
                  ? "Extraction des lignes et des totaux…"
                  : "Analyse terminée — hausses et marge mises à jour."}
            </div>

            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              {ANALYSE_STEPS.map((step, i) => {
                const visible = frame >= analyseStart + 14 + i * 9;
                const done = i <= activeStep && frame >= analyseStart + 20;
                return (
                  <li
                    key={step.text}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      opacity: visible ? 1 : 0,
                      transform: `translateY(${visible ? 0 : 6}px)`,
                      color: done ? C.ink : C.muted,
                      fontWeight: done ? 600 : 500,
                    }}
                  >
                    <span style={{ color: done ? "#16A34A" : C.accent, fontWeight: 700 }}>
                      {done ? "✓" : "·"}
                    </span>
                    {step.text}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: C.muted,
            paddingLeft: 4,
            opacity: interpolate(frame, [analyseStart + 60, analyseStart + 75], [0, 1], clamp),
          }}
        >
          {TEMPLATE_COPY.prompt}
        </p>
      </div>
    </div>
  );
}
