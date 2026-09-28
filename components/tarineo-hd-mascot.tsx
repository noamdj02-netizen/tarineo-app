import Image from "next/image";

import { TARINEO_HD_MASCOTS, type TarineoHdMascotName } from "@/lib/tarineo-hd-mascots";
import { cn } from "@/lib/utils";

/** Mascotte 3D TARINEO (export Figma HD, fond transparent). */
export function TarineoHdMascot({
  name,
  className,
  label,
  priority,
}: {
  name: TarineoHdMascotName;
  className?: string;
  label?: string;
  priority?: boolean;
}) {
  const { src, label: defaultLabel, width, height } = TARINEO_HD_MASCOTS[name];
  const alt = label ?? defaultLabel;
  return (
    <span
      className={cn("relative flex shrink-0 items-end justify-center leading-none", className)}
      role={alt ? "img" : undefined}
      aria-label={alt}
    >
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        sizes="140px"
        className="h-full w-full object-contain object-bottom"
        priority={priority}
        loading={priority ? undefined : "lazy"}
      />
    </span>
  );
}

export type { TarineoHdMascotName };
