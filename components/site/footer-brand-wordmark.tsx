import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export type FooterBrandWordmarkTone = "on-light" | "on-dark";

const wordmarkBase =
  "select-none text-center font-display text-[clamp(4.75rem,20vw,12.5rem)] leading-[0.78] font-semibold tracking-tightest [mask-image:linear-gradient(180deg,black_8%,transparent_88%)]";

export function footerBrandWordmarkClass(
  tone: FooterBrandWordmarkTone,
  className?: string,
) {
  return cn(
    wordmarkBase,
    tone === "on-light" ? "text-black/[0.06]" : "text-white/[0.06]",
    className,
  );
}

/** Grand mot-symbole en bas de footer (même traitement que le site marketing sombre). */
export function FooterBrandWordmark({
  tone,
  className,
}: {
  tone: FooterBrandWordmarkTone;
  className?: string;
}) {
  return (
    <p aria-hidden className={footerBrandWordmarkClass(tone, className)}>
      {BRAND.name}
    </p>
  );
}
