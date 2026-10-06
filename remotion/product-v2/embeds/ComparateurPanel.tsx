import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { C, SHADOW } from "../constants";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { SoftCard } from "../ui";
import { fontSans } from "../../fonts";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

/** Miroir écran comparateur distributeurs. */
export function ComparateurPanel() {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [12, 28], [0, 1], clamp);

  return (
    <div style={{ fontFamily: fontSans }}>
      <DashboardPageHeader
        title="Comparateur"
        description="Même référence fabricant · vos distributeurs."
        showActions={false}
      />
      <p style={{ margin: "0 0 16px", fontSize: 15, color: C.muted }}>Vanne d’arrêt 3/4</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, opacity: reveal }}>
        <SoftCard style={{ padding: 20, boxShadow: SHADOW }}>
          <p style={{ margin: 0, fontSize: 12, color: C.muted }}>Cedeo · ce devis</p>
          <p style={{ margin: "10px 0 0", fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em" }}>19,95 €</p>
        </SoftCard>
        <SoftCard
          style={{
            padding: 20,
            boxShadow: SHADOW,
            border: "1px solid rgba(22,163,74,0.35)",
            background: "rgba(22,163,74,0.06)",
          }}
        >
          <p style={{ margin: 0, fontSize: 12, color: "#15803D", fontWeight: 600 }}>Rexel · moins cher</p>
          <p style={{ margin: "10px 0 0", fontSize: 32, fontWeight: 700, color: "#15803D", letterSpacing: "-0.03em" }}>
            17,80 €
          </p>
        </SoftCard>
      </div>
      <p
        style={{
          marginTop: 18,
          fontSize: 16,
          fontWeight: 600,
          color: "#15803D",
          opacity: interpolate(frame, [28, 42], [0, 1], clamp),
        }}
      >
        Économie : 2,15 € sur cette ligne
      </p>
    </div>
  );
}
