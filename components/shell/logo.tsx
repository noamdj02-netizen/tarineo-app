import Link from "next/link";
import { TarineoLogo, type TarineoLogoVariant } from "@/components/brand/tarineo-logo";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const SIZE_PX = { sm: 28, md: 32, lg: 40 } as const;

/** Logo TARINEO du chrome app. `theme` = fond (light UI → logo light, dark UI → logo dark). */
export function Logo({
  className,
  theme = "light",
  size = "md",
  showWordmark = false,
  chrome = "side",
}: {
  className?: string;
  theme?: TarineoLogoVariant;
  size?: "sm" | "md" | "lg" | number;
  /** Affiche le nom TARINEO à côté du picto. */
  showWordmark?: boolean;
  /** Palette : sidebar (tokens side) ou topbar mobile (tokens ink). */
  chrome?: "side" | "bar";
}) {
  const px = typeof size === "number" ? size : SIZE_PX[size];

  if (!showWordmark) {
    return (
      <TarineoLogo
        href="/accueil"
        variant={theme}
        size={size}
        priority
        className={cn("min-h-11", className)}
      />
    );
  }

  const markFrame =
    chrome === "bar"
      ? "border-line bg-surface-2"
      : "border-side-line bg-[color:var(--color-side-card)]";
  const word =
    chrome === "bar"
      ? "text-ink"
      : "text-side-ink";

  return (
    <Link
      href="/accueil"
      aria-label={BRAND.name}
      className={cn(
        "group inline-flex min-h-11 items-center gap-2 rounded-[10px] outline-none transition-opacity duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-tarineo-orange/35",
        className,
      )}
    >
      <span
        className={cn(
          "grid shrink-0 place-items-center overflow-hidden rounded-[22%] shadow-soft",
          markFrame,
        )}
        style={{ width: px + 4, height: px + 4 }}
      >
        <TarineoLogo variant={theme} size={px + 2} priority decorative />
      </span>
      <span className={cn("font-display text-[14px] font-semibold tracking-[-0.03em] sm:text-[15px]", word)}>
        {BRAND.name}
      </span>
    </Link>
  );
}
