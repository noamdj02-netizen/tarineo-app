import Image from "next/image";
import { cn } from "cn";
import { MASCOTTE_DASHBOARD, type MascotteDashboardVariant } from "@/lib/mascottesDashboard";

type Props = {
  variant: MascotteDashboardVariant;
  className?: string;
  priority?: boolean;
  /** Override taille d'affichage (mobile Accueil, etc.) */
  width?: number;
  height?: number;
};

/** Mascotte 3D dashboard — empty states et bannières (Figma nodes 207:39413–39426). */
export function MascotteDashboard({ variant, className, priority, width, height }: Props) {
  const config = MASCOTTE_DASHBOARD[variant];
  const w = width ?? config.width;
  const h = height ?? config.height;

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: w, height: h }}>
      <Image
        src={config.src}
        alt={config.alt}
        width={config.imageWidth}
        height={config.imageHeight}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
