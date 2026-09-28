import Image from "next/image";
import { TARINEO_HD_MASCOTS, type TarineoHdMascotName } from "@/lib/tarineo-hd-mascots";
import { cn } from "@/lib/utils";

/**
 * Poses Figma « Mascottes — Originaux HD » (node 414:72).
 * Sources PNG ~1200–1500 px, fond transparent — pas de SVG (illustration raster 3D).
 * Ne jamais upscaler une petite image : on sert le fichier HD et on laisse le navigateur
 * / Next Image générer un dérivé ≥ 4× la taille d’affichage.
 */
const VARIANT = {
  header: {
    box: 40,
    art: 36,
    pose: "03-salut" as const,
    sizes: "144px",
  },
  message: {
    box: 32,
    art: 32,
    pose: "02-clin-oeil" as const,
    sizes: "128px",
  },
  fab: {
    box: 28,
    art: 28,
    pose: "03-salut" as const,
    sizes: "112px",
  },
  /** Bouton IA central de la navbar mobile (64px). */
  nav: {
    box: 52,
    art: 50,
    pose: "03-salut" as const,
    sizes: "200px",
  },
} as const;

export type TarineoCopilotAvatarVariant = keyof typeof VARIANT;

export function TarineoCopilotAvatar({
  variant = "header",
  className,
  alt = "",
}: {
  variant?: TarineoCopilotAvatarVariant;
  className?: string;
  /** Décoratif par défaut (aria-hidden). Passer un alt si le contexte l’exige. */
  alt?: string;
}) {
  const v = VARIANT[variant];
  const art = TARINEO_HD_MASCOTS[v.pose as TarineoHdMascotName];
  const decorative = !alt;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center leading-none",
        className,
      )}
      style={{ width: v.box, height: v.box }}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : alt}
    >
      <Image
        src={art.src}
        alt={alt}
        width={art.width}
        height={art.height}
        sizes={v.sizes}
        quality={100}
        priority={variant === "header" || variant === "fab" || variant === "nav"}
        className="object-contain object-center"
        style={{
          width: v.art,
          height: v.art,
          maxWidth: v.art,
          maxHeight: v.art,
        }}
        // Illustration HD : éviter la recompression agressive du pipeline Image
        unoptimized
      />
    </span>
  );
}

/** Compatibilité : mappe une taille numérique vers le variant Figma. */
export function CopilotFace({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const variant: TarineoCopilotAvatarVariant =
    size >= 36 ? "header" : size >= 30 ? "message" : "fab";
  return <TarineoCopilotAvatar variant={variant} className={className} />;
}
