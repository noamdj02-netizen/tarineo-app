import Image from "next/image";
import Link from "next/link";

/** Icône Tarineo — PNG transparent (landing + auth). */
export const BRAND_LOGO_SRC = "/landing/logo-icon.png";
export const BRAND_MARK_SRC = "/dashboard/logo.png";

type WordmarkStyle = "landing" | "auth" | "app" | "dashboard";

interface Props {
  href?: string | null;
  showWordmark?: boolean;
  wordmarkStyle?: WordmarkStyle;
  iconClassName?: string;
  className?: string;
  priority?: boolean;
}

function Wordmark({ style }: { style: WordmarkStyle }) {
  if (style === "dashboard") {
    return (
      <span className="font-[family-name:var(--font-geist)] text-[32px] font-semibold leading-none tracking-normal text-[var(--foreground)]">
        Tarineo
      </span>
    );
  }

  if (style === "landing") {
    return (
      <span className="landing-display text-[2rem] font-semibold uppercase leading-none tracking-tight text-[var(--landing-text)]">
        Tarineo
      </span>
    );
  }

  if (style === "auth") {
    return <span className="text-[23px] font-extrabold tracking-tight lg:text-[24px]">TARINEO</span>;
  }

  return (
    <span className="font-[family-name:var(--font-geist)] text-lg font-semibold tracking-tight text-[var(--foreground)]">
      Tarineo
    </span>
  );
}

export function BrandLogo({
  href = "/",
  showWordmark = true,
  wordmarkStyle = "landing",
  iconClassName = "h-7 w-7",
  className = "",
  priority = false,
}: Props) {
  const markSrc = wordmarkStyle === "dashboard" || wordmarkStyle === "app" ? BRAND_MARK_SRC : BRAND_LOGO_SRC;

  const content = (
    <>
      <Image
        src={markSrc}
        alt=""
        width={wordmarkStyle === "dashboard" ? 62 : 128}
        height={wordmarkStyle === "dashboard" ? 56 : 128}
        unoptimized={markSrc.endsWith(".png")}
        className={`${iconClassName} shrink-0 bg-transparent object-contain object-center`}
        priority={priority}
      />
      {showWordmark && <Wordmark style={wordmarkStyle} />}
    </>
  );

  const classes = `inline-flex items-center gap-2 ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <span className={classes}>{content}</span>;
}
