import Image from "next/image";

/** Icône app Tarinéo (barres 3D sur fond blanc arrondi). */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <Image
      src="/landing/v2/tarineo-app-icon.png"
      alt=""
      width={512}
      height={512}
      aria-hidden
      className={`shrink-0 rounded-[10px] object-cover ${className}`}
      priority
    />
  );
}

export function Logo({ className = "", markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={markClassName} />
      <span className="hidden text-[1.0625rem] leading-none font-bold tracking-[0.08em] text-ink-900 min-[380px]:inline">
        TARINEO
      </span>
    </span>
  );
}
