import Image from "next/image";
import { cn } from "cn";
import { MASCOTTE_DASHBOARD, type MascotteDashboardVariant } from "@/lib/mascottesDashboard";

type Props = {
  variant: MascotteDashboardVariant;
  className?: string;
  priority?: boolean;
};

/** Mascotte 3D dashboard — empty states et bannières (Figma nodes 207:39413–39426). */
export function MascotteDashboard({ variant, className, priority }: Props) {
  const config = MASCOTTE_DASHBOARD[variant];

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: config.width, height: config.height }}
    >
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
