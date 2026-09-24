import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Logo en Instrument Serif. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/accueil"
      className={cn(
        "inline-flex min-h-11 items-center font-serif text-[28px] leading-none tracking-[-0.02em]",
        className,
      )}
      aria-label={`${BRAND.name}, accueil`}
    >
      {BRAND.name}
      <span className="text-accent-2 italic">.</span>
    </Link>
  );
}
