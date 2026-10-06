import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DevisDocMock } from "./DevisDocMock";
import { C } from "../constants";
import { DEVIS_SAMPLES } from "../data";
import { clamp } from "../ui";

const FLOW = [
  {
    label: "Devis fournisseur",
    sample: DEVIS_SAMPLES[0],
  },
  {
    label: "Bon de commande",
    sample: {
      ...DEVIS_SAMPLES[0],
      id: "bc-transform",
      kind: "BON" as const,
      ref: "BC-4421",
      title: "Commande Cedeo",
    },
  },
  {
    label: "Facture client",
    sample: {
      ...DEVIS_SAMPLES[1],
      id: "fac-client",
      kind: "FACTURE" as const,
      ref: "Facture 2026-028",
      title: "Rénovation · Martin",
      supplier: "Votre entreprise",
    },
  },
] as const;

const PHASE_FRAMES = 14;

/** Carte Mutate centre — enchaînement devis → BC → facture client. */
export function DocumentTransformCard({ size = 292 }: { size?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phase = Math.min(FLOW.length - 1, Math.floor(frame / PHASE_FRAMES));
  const local = frame - phase * PHASE_FRAMES;
  const next = Math.min(FLOW.length - 1, phase + 1);
  const morph = interpolate(local, [PHASE_FRAMES - 5, PHASE_FRAMES], [0, 1], clamp);
  const pop = spring({ frame: local, fps, config: { damping: 14, stiffness: 200 } });

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 0 0 1px rgba(10,10,10,0.05), 0 12px 36px rgba(10,10,10,0.1)",
        background: C.white,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 1 - morph,
          transform: `scale(${pop})`,
        }}
      >
        <DevisDocMock sample={FLOW[phase].sample} />
      </div>
      {phase < FLOW.length - 1 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: morph,
            transform: `scale(${interpolate(morph, [0, 1], [0.94, 1], clamp)})`,
          }}
        >
          <DevisDocMock sample={FLOW[next].sample} />
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "10px 12px",
          background: "linear-gradient(transparent, rgba(10,10,10,0.75))",
          color: "#fff",
          zIndex: 5,
        }}
      >
        <p style={{ margin: 0, fontSize: 10, letterSpacing: "0.12em", opacity: 0.85 }}>TRANSFORMATION</p>
        <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 650 }}>{FLOW[phase].label}</p>
      </div>

      {phase < FLOW.length - 1 && local > PHASE_FRAMES - 8 ? (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 28,
            height: 28,
            borderRadius: 999,
            background: C.accent,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 16,
            fontWeight: 700,
            opacity: morph,
            zIndex: 6,
          }}
        >
          →
        </div>
      ) : null}
    </div>
  );
}
