import Link from "next/link";
import { TarineoMark } from "@/components/site/tarineo-mark";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function SiteLogo({
  href = "/",
  className,
  imageClassName,
  showWordmark = true,
  priority = true,
  onDark = false,
}: {
  href?: string;
  className?: string;
  imageClassName?: string;
  showWordmark?: boolean;
  /** Précharger le logo (header) ; false dans le footer. */
  priority?: boolean;
  /** Wordmark clair, pour les cartes noires. */
  onDark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label={`${BRAND.name}, page d'accueil`}
    >
      <TarineoMark className={imageClassName} priority={priority} />
      {showWordmark ? (
        <span
          className={cn(
            "font-display text-[21px] leading-none font-semibold tracking-[-0.035em]",
            onDark && "text-white",
          )}
          translate="no"
        >
          {BRAND.name}
        </span>
      ) : null}
    </Link>
  );
}
