import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const TARINEO_LOGO_SRC = {
  light: "/brand/tarineo-logo-light.png",
  dark: "/brand/tarineo-logo-dark.png",
} as const;

const SIZE_PX = {
  sm: 30,
  md: 32,
  lg: 40,
} as const;

export type TarineoLogoVariant = "light" | "dark";
export type TarineoLogoSize = keyof typeof SIZE_PX | number;

/** Logo officiel TARINEO (fichiers raster). Light = UI claire, dark = UI sombre. */
export function TarineoLogo({
  variant,
  className,
  priority = false,
  size = "md",
  href,
  decorative = false,
}: {
  variant: TarineoLogoVariant;
  className?: string;
  priority?: boolean;
  size?: TarineoLogoSize;
  href?: string;
  decorative?: boolean;
}) {
  const px = typeof size === "number" ? size : SIZE_PX[size];
  const image = (
    <Image
      src={TARINEO_LOGO_SRC[variant]}
      alt={decorative || href ? "" : "TARINEO"}
      width={px * 3}
      height={px * 3}
      priority={priority}
      aria-hidden={decorative || href ? true : undefined}
      className={cn("w-auto shrink-0 object-contain", !href && className)}
      style={{ height: px, width: "auto", imageRendering: "auto" }}
    />
  );

  if (!href) return image;

  return (
    <Link href={href} className={cn("inline-flex items-center", className)} aria-label="TARINEO">
      {image}
    </Link>
  );
}
