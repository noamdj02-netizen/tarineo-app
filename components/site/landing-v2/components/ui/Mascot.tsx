export type MascotName =
  | "hero"
  | "loupe"
  | "ordinateur"
  | "chrono"
  | "bras-croises"
  | "clin-oeil"
  | "devis-valide"
  | "pouce-leve"
  | "salut"
  | "pancarte"
  | "bulle"
  | "equipe"
  | "404";

/** Dimensions intrinsèques des rendus détourés, pour éviter tout décalage. */
const intrinsic: Record<MascotName, { w: number; h: number }> = {
  hero: { w: 972, h: 1088 },
  loupe: { w: 1013, h: 1110 },
  ordinateur: { w: 908, h: 1006 },
  chrono: { w: 813, h: 1156 },
  "bras-croises": { w: 851, h: 1154 },
  "clin-oeil": { w: 894, h: 930 },
  "devis-valide": { w: 977, h: 1099 },
  "pouce-leve": { w: 1039, h: 1138 },
  salut: { w: 900, h: 1072 },
  pancarte: { w: 1040, h: 1092 },
  bulle: { w: 1100, h: 763 },
  equipe: { w: 1100, h: 985 },
  "404": { w: 669, h: 1093 },
};

/**
 * Mascotte TARINEO, réutilisée telle quelle depuis les visuels fournis.
 * Elle sert d'élément narratif : jamais de fond décoratif, jamais partout.
 *
 * - `size` fixe une largeur en pixels (hauteur déduite du ratio d'origine).
 * - `widthClass` laisse la largeur au CSS, pour les cas où elle doit varier
 *   selon la taille de l'écran ; la hauteur suit alors le ratio intrinsèque.
 */
export function Mascot({
  name,
  alt,
  className = "",
  size,
  widthClass,
  priority = false,
}: {
  name: MascotName;
  alt: string;
  className?: string;
  size?: number;
  widthClass?: string;
  priority?: boolean;
}) {
  const { w, h } = intrinsic[name];
  const displayWidth = size;
  const displayHeight = size ? Math.round((size * h) / w) : undefined;

  return (
    <img
      src={`/landing/v2/mascots/mascot-${name}.webp`}
      alt={alt}
      width={w}
      height={h}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
      style={displayWidth ? { width: displayWidth, height: displayHeight } : undefined}
      className={`${widthClass ? `${widthClass} h-auto` : ""} ${className}`}
    />
  );
}