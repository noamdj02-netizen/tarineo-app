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
  /** Nav / fond clair → texte sombre ; nav sombre sur hero → texte clair. */
  lightNav = false,
  /** @deprecated Utiliser `lightNav` (inverse). */
  onDark = false,
}: {
  href?: string;
  className?: string;
  imageClassName?: string;
  showWordmark?: boolean;
  priority?: boolean;
  lightNav?: boolean;
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
            lightNav && !onDark ? "text-ink" : "text-white",
          )}
          translate="no"
        >
          {BRAND.name}
        </span>
      ) : null}
    </Link>
  );
}
