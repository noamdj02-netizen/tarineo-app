import { HERO_BENEFITS } from "@/lib/site/tarineo";

/** Bandeau discret sous le hero — sous-titres seulement, pas de doublon avec le H1. */
export function HeroBenefits() {
  return (
    <div
      className="mx-auto mt-14 max-w-[1120px] border-t border-line px-4 pt-6 sm:px-8 lg:mt-16 lg:pt-7"
      aria-label="Points clés"
    >
      <ul className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
        {HERO_BENEFITS.map((item, i) => (
          <li key={item.title} className="flex items-center gap-2 sm:gap-1">
            {i > 0 ? (
              <span className="hidden text-muted-foreground/40 sm:inline" aria-hidden>·</span>
            ) : null}
            <span className="text-[12.5px] leading-snug text-landing-ink-muted sm:text-[13px]">
              <span className="text-ink/75">{item.title}</span>
              <span className="text-ink/25"> — </span>
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
