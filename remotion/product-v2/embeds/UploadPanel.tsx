import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { C, SHADOW } from "../constants";
import { DOCS } from "../data";
import { SoftCard } from "../ui";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

const STARTS = [
  { x: -480, y: -200 },
  { x: 460, y: -160 },
  { x: -420, y: 180 },
  { x: 470, y: 150 },
];

/** Zone dropzone — même bloc que `UploadScene`. */
export function UploadPanel() {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SoftCard
        style={{
          width: 640,
          height: 360,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          borderStyle: "dashed",
          borderColor: "rgba(255,107,26,0.4)",
          borderWidth: 1.5,
          background: "rgba(255,107,26,0.03)",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: C.accentSoft,
            color: C.accent,
            display: "grid",
            placeItems: "center",
            fontSize: 28,
            fontWeight: 500,
            marginBottom: 14,
          }}
        >
          +
        </div>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 650, color: C.ink }}>Importer un document</p>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: C.muted }}>PDF · photo · devis fournisseur</p>

        {DOCS.map((doc, i) => {
          const start = 16 + i * 10;
          const p = interpolate(frame, [start, start + 22], [0, 1], clamp);
          const x = interpolate(p, [0, 1], [STARTS[i].x, (i - 1.5) * 40], clamp);
          const y = interpolate(p, [0, 1], [STARTS[i].y, 78 + (i % 2) * 6], clamp);
          const rot = interpolate(p, [0, 1], [i % 2 === 0 ? -10 : 9, 0], clamp);
          return (
            <div
              key={doc.name}
              style={{
                position: "absolute",
                left: "50%",
                top: "40%",
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rot}deg)`,
                opacity: p,
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "12px 16px",
                minWidth: 190,
                boxShadow: SHADOW,
              }}
            >
              <p style={{ margin: 0, fontSize: 11, color: C.accent, fontWeight: 650 }}>{doc.kind}</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 600 }}>{doc.name}</p>
            </div>
          );
        })}
      </SoftCard>
    </div>
  );
}
