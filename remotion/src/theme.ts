/** Tokens alignés sur src/app/globals.css (.app-theme) */
export const TOKENS = {
  background: "#ffffff",
  foreground: "#172935",
  card: "#ffffff",
  primary: "#ec5821",
  primaryForeground: "#ffffff",
  secondary: "#f8f8f8",
  mutedForeground: "#53616a",
  border: "#dcdfe1",
  textBody: "#333d44",
  green: "#52c64f",
  star: "#ffb800",
  danger: "#d64545",
  dangerBg: "#fdecec",
  warningBg: "#fff3e6",
  orangePale: "#fff0e8",
  pageBg: "#ffffff",
  chartTrack: "#f0f1f1",
  chartFill: "#e1e3e5",
};

/** Alias pour les scènes intro/outro (AnimatedText, Background) */
export const COLORS = {
  white: TOKENS.background,
  ink: TOKENS.foreground,
  muted: TOKENS.mutedForeground,
  orange: TOKENS.primary,
  orangePale: TOKENS.orangePale,
  danger: TOKENS.danger,
  dangerBg: TOKENS.dangerBg,
  appBg: TOKENS.pageBg,
  night: "#141c2b",
};

export const FONT = "system-ui, -apple-system, 'Segoe UI', sans-serif";

export const RADIUS = {
  card: 24,
  inner: 20,
  pill: 100,
};
