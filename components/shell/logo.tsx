import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Logo en Space Grotesk. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/accueil"
      className={cn(
        "inline-flex min-h-11 items-center font-grotesk text-[24px] leading-none font-bold tracking-[-0.04em]",
        className,
      )}
      aria-label={`${BRAND.name}, accueil`}
    >
      {BRAND.name}
      <span className="text-accent-2">.</span>
    </Link>
  );
}
