import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function SiteLogo({
  href = "/",
  className,
  imageClassName,
  showWordmark = true,
  priority = true,
  onDark = false,
  variant = "default",
}: {
  href?: string;
  className?: string;
  imageClassName?: string;
  showWordmark?: boolean;
  priority?: boolean;
  /** Wordmark clair, pour les cartes noires. */
  onDark?: boolean;
  /** `landing` = illustration fondateur (site public). */
  variant?: "default" | "landing";
}) {
  const src = variant === "landing" ? BRAND.logoLandingSrc : BRAND.logoSrc;

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label={`${BRAND.name}, page d'accueil`}
    >
      <Image
        src={src}
        alt=""
        width={40}
        height={40}
        priority={priority}
        className={cn(
          "size-9 shrink-0 object-contain",
          variant === "landing" ? "rounded-md" : "rounded-lg",
          onDark && variant === "landing" && "brightness-0 invert",
          imageClassName,
        )}
      />
      {showWordmark ? (
        <span
          className={cn(
            "font-grotesk text-[22px] leading-none font-bold tracking-[-0.04em]",
            onDark && "text-accent-ink",
          )}
        >
          {BRAND.name}
          <span className="text-brand-violet">.</span>
        </span>
      ) : null}
    </Link>
  );
}
