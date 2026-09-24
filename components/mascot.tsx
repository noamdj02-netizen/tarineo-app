import Image from "next/image";

import { MASCOTS, type MascotName } from "@/lib/mascots";
import { cn } from "@/lib/utils";

/** Mascotte landing (export Figma, ratio paysage). */
export function Mascot({
  name,
  className,
  label,
  priority,
}: {
  name: MascotName;
  className?: string;
  label?: string;
  priority?: boolean;
}) {
  const { src, label: defaultLabel } = MASCOTS[name];
  const alt = label ?? defaultLabel;
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-end justify-end", className)}
      role={alt ? "img" : undefined}
      aria-label={alt}
    >
      <Image
        src={src}
        alt=""
        width={684}
        height={507}
        sizes="(max-width: 640px) 120px, 140px"
        className="h-full w-auto max-h-full object-contain object-bottom"
        priority={priority}
        loading={priority ? undefined : "lazy"}
      />
    </span>
  );
}
