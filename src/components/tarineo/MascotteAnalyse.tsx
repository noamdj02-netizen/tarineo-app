import Image from "next/image";
import { cn } from "cn";
import { MASCOTTE_DASHBOARD } from "@/lib/mascottesDashboard";

type Props = {
  className?: string;
  /** sm ≈ 140px, md ≈ 190px, lg ≈ 240px de large */
  size?: "sm" | "md" | "lg";
  priority?: boolean;
};

const LARGEURS = { sm: 140, md: 190, lg: 240 } as const;

/** Mascotte loupe — import de document et analyse IA en cours (Figma 207:39425). */
export function MascotteAnalyse({ className, size = "md", priority }: Props) {
  const config = MASCOTTE_DASHBOARD.loupe;
  const largeur = LARGEURS[size];
  const hauteur = Math.round(largeur * (config.height / config.width));

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: largeur, height: hauteur }}>
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
