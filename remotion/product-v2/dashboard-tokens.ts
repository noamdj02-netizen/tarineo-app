/** Tokens UI — alignés sur `app/globals.css` + dashboard accueil. */
export const DASH = {
  canvas: "#F5F5F3",
  surface: "#FFFFFF",
  surface2: "#F7F7F5",
  ink: "#0A0A0A",
  muted: "#737373",
  line: "rgba(10, 10, 10, 0.08)",
  lineStrong: "rgba(10, 10, 10, 0.14)",
  orange: "#FF6B1A",
  orangeSoft: "rgba(255, 107, 26, 0.1)",
  side: "#FFFFFF",
  sideInk: "#0A0A0A",
  sideHint: "#737373",
  sideLine: "rgba(10, 10, 10, 0.08)",
  sideActive: "rgba(255, 107, 26, 0.1)",
  shadowSoft:
    "0 0 0 1px rgba(10,10,10,0.04), 0 2px 8px rgba(10,10,10,0.04), 0 16px 40px -24px rgba(10,10,10,0.12)",
  radiusCard: 14,
  radiusBtn: 12,
  radiusBtnMd: 10,
} as const;

export const BTN_PRIMARY = {
  height: 38,
  paddingX: 16,
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 10,
  background: DASH.orange,
  color: "#FFFFFF",
} as const;

export const BTN_SECONDARY = {
  height: 38,
  paddingX: 16,
  fontSize: 13,
  fontWeight: 500,
  borderRadius: 10,
  background: DASH.surface,
  color: DASH.ink,
  border: `1px solid ${DASH.line}`,
} as const;
