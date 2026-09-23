import Link from "next/link";
import { MOBILE_GRADIENT_ACCENT } from "./mobileTokens";

export function MobileSectionHeader({
  title,
  href,
  linkLabel = "Voir tout",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[22px] font-medium leading-tight tracking-[-0.3px] text-black">{title}</h2>
      {href && (
        <Link
          href={href}
          className="shrink-0 bg-clip-text text-[15px] font-medium text-transparent"
          style={{ backgroundImage: MOBILE_GRADIENT_ACCENT }}
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
