import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function SiteLogo({
  href = "/",
  className,
  imageClassName,
  showWordmark = true,
}: {
  href?: string;
  className?: string;
  imageClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label={`${BRAND.name}, page d'accueil`}
    >
      <Image
        src={BRAND.logoSrc}
        alt=""
        width={40}
        height={40}
        priority
        className={cn("size-9 shrink-0 rounded-lg object-contain", imageClassName)}
      />
      {showWordmark ? (
        <span className="font-grotesk text-[22px] leading-none font-bold tracking-[-0.04em]">
          {BRAND.name}
          <span className="text-accent-2">.</span>
        </span>
      ) : null}
    </Link>
  );
}
