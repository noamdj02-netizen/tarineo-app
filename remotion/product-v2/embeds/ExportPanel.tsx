import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { C, SHADOW } from "../constants";
import { SoftCard } from "../ui";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: EASE,
};

const TABS = ["Manuel", "Automatisation", "Historique"] as const;

const PREVIEW_ROWS = [
  ["2026-09-02", "Point.P", "Facture", "1 248,00 €"],
  ["2026-09-14", "Descours", "Facture", "892,40 €"],
  ["2026-09-21", "Client Dupont", "Facture", "3 450,00 €"],
] as const;

/** Corps `ExportComptableScene`. */
export function ExportPanel() {
  const frame = useCurrentFrame();
  const tab = frame < 28 ? 0 : frame < 52 ? 1 : 2;
  const sendPulse = interpolate(frame, [58, 68], [1, 1.04], clamp);
  const sent = frame >= 62;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      <div style={{ display: "flex", gap: 8 }}>
        {TABS.map((label, i) => {
          const active = i === tab;
          return (
            <div
              key={label}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                background: active ? C.ink : C.white,
                color: active ? C.white : C.muted,
                border: `1px solid ${active ? C.ink : C.border}`,
                boxShadow: active ? SHADOW : "none",
              }}
            >
              {label}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
        <SoftCard style={{ flex: 1.2, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: "0.08em" }}>
            APERÇU CSV
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ color: C.muted, textAlign: "left" }}>
                <th style={{ padding: "6px 4px" }}>Date</th>
                <th style={{ padding: "6px 4px" }}>Tiers</th>
                <th style={{ padding: "6px 4px" }}>Type</th>
                <th style={{ padding: "6px 4px" }}>HT</th>
              </tr>
            </thead>
            <tbody>
              {PREVIEW_ROWS.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    opacity: interpolate(frame, [12 + ri * 6, 22 + ri * 6], [0, 1], clamp),
                    borderTop: `1px solid ${C.border}`,
                  }}
                >
                  {row.map((cell) => (
                    <td key={cell} style={{ padding: "8px 4px", fontWeight: ri === 0 ? 600 : 500 }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </SoftCard>

        <SoftCard style={{ flex: 0.85, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: "0.08em" }}>
            {tab === 1 ? "PLANIFICATION" : "ENVOI"}
          </p>
          {tab === 1 ? (
            <>
              <Row label="Fréquence" value="Mensuel · le 5" />
              <Row label="Période" value="Mois précédent" />
              <Row label="Destinataire" value="compta@cabinet.fr" />
            </>
          ) : (
            <>
              <Row label="Période" value="T3 2026" />
              <Row label="Factures" value="24 lignes" />
              <div
                style={{
                  marginTop: 8,
                  height: 40,
                  borderRadius: 10,
                  background: sent ? "#0A0A0A" : C.accent,
                  color: C.white,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 650,
                  transform: `scale(${sendPulse})`,
                }}
              >
                {sent ? "CSV envoyé ✓" : "Télécharger le CSV"}
              </div>
            </>
          )}
        </SoftCard>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
      <span style={{ color: C.muted }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
