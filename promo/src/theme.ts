/** Tokens Mono Lead — copie de app/globals.css @theme. */
export const C = {
  bg: "#f3f3f2",
  surface: "#ffffff",
  surface2: "#f6f6f5",
  ink: "#111111",
  muted: "#8c8c8c",
  line: "rgba(17, 17, 17, 0.08)",
  accent2: "#9a9a9a",
  accentSoft: "#f4f4f3",
  side: "#111111",
  sideInk: "#ffffff",
  sideMuted: "rgba(255, 255, 255, 0.5)",
  sideLine: "rgba(255, 255, 255, 0.08)",
  glow1: "#f7c6a3",
  glow2: "#cbbdf3",
  glow3: "#b3cbf6",
  focus: "#16a34a",
  focusSoft: "#e8f7ee",
  focusInk: "#166534",
  pause: "#eab308",
  pauseSoft: "#fdf6dc",
  pauseInk: "#854d0e",
  fini: "#dc2626",
  finiSoft: "#fdecec",
  finiInk: "#991b1b",
} as const;

export const SHADOW_SOFT =
  "0 0 0 1px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.04), 0 16px 40px -18px rgba(0,0,0,0.18)";
export const SHADOW_LIFT =
  "0 0 0 1px rgba(0,0,0,0.05), 0 4px 10px rgba(0,0,0,0.05), 0 24px 48px -20px rgba(0,0,0,0.24)";
export const SHADOW_DARK =
  "inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.2), 0 8px 20px -8px rgba(0,0,0,0.45)";

export const TABS = [
  "Accueil",
  "Projets",
  "Ressources",
  "Outils",
  "Schémas",
  "Anatomie",
  "Composants",
  "Composants 2",
  "Thèmes",
  "Mes sites",
] as const;

export const STAGES = ["Valider", "MVP", "Bêta", "1ère vente", "100 clients", "Scale"] as const;
