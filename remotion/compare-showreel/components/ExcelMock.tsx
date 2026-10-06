import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../../animations";
import { THEME } from "../constants";
import { fontMono, fontSans } from "../fonts";

const ROWS = [
  ["Réf.", "Fournisseur", "Prix", "Statut"],
  ["PVC-500", "Cedeo", "22,40", "—"],
  ["PER-16", "Point.P", "14,20", "—"],
  ["VANNE-34", "Rexel", "19,95", "—"],
  ["???", "mail reçu", "—", "À saisir"],
  ["PVC-500", "Cedeo", "24,60", "—"],
];

export const ExcelMock: React.FC<{ start?: number; chaotic?: boolean }> = ({
  start = 0,
  chaotic = false,
}) => {
  const frame = useCurrentFrame();
  const shake = chaotic
    ? Math.sin(frame * 0.7) * interpolate(frame, [start, start + 40], [0, 3], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const reveal = interpolate(frame, [start, start + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  return (
    <div
      style={{
        borderRadius: 14,
        overflow: "hidden",
        border: `1px solid rgba(29,111,66,0.25)`,
        boxShadow: "0 24px 60px -28px rgba(10,10,10,0.35)",
        transform: `translateX(${shake}px) rotate(${chaotic ? shake * 0.15 : 0}deg)`,
        opacity: reveal,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          background: THEME.excelGreen,
          color: "#fff",
          fontFamily: fontSans,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <span style={{ opacity: 0.9 }}>Suivi_achats_2026_FINAL_v3.xlsx</span>
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: THEME.excelBg,
          fontFamily: fontMono,
          fontSize: 13,
        }}
      >
        <tbody>
          {ROWS.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={`${ri}-${ci}`}
                  style={{
                    padding: "10px 12px",
                    border: "1px solid rgba(10,10,10,0.08)",
                    color: ri === 0 ? THEME.excelMuted : THEME.ink,
                    fontWeight: ri === 0 ? 600 : 500,
                    background:
                      ri === 4 && chaotic
                        ? "rgba(220,38,38,0.12)"
                        : ri === 5 && chaotic
                          ? "rgba(220,38,38,0.08)"
                          : ri % 2 === 0
                            ? "rgba(255,255,255,0.45)"
                            : "transparent",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {chaotic ? (
        <p
          style={{
            margin: 0,
            padding: "12px 14px",
            fontFamily: fontSans,
            fontSize: 14,
            color: THEME.danger,
            fontWeight: 600,
            background: "rgba(220,38,38,0.06)",
          }}
        >
          Hausse non vue · marge qui fond
        </p>
      ) : null}
    </div>
  );
};
