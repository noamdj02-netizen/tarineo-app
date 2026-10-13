import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { LandingSection, LandingSectionHead } from "@/components/site/landing-section";
import { CHANTIER_DOSSIERS, CHANTIER_ISO, DEMO_MARK } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

const AVATARS = [
  "/landing/figma/avatar-1.jpg",
  "/landing/figma/avatar-2.jpg",
  "/landing/figma/avatar-3.jpg",
] as const;

/** Split Figma : liste de dossiers + fiche isométrique. */
export function LandingChantiers() {
  const featured = CHANTIER_DOSSIERS[0];

  return (
    <LandingSection id="chantiers">
      <InView className="mx-auto grid max-w-[1180px] items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
        <div>
          <LandingSectionHead
            align="start"
            label={CHANTIER_ISO.badge}
            title={CHANTIER_ISO.title}
            tail={CHANTIER_ISO.tail}
            text={CHANTIER_ISO.text}
            className="mb-8"
          />
          <Reveal>
            <ul className="flex flex-col">
              {CHANTIER_DOSSIERS.map((d, i) => (
                <li
                  key={d.name}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3",
                    i === 0 && "border border-line bg-white shadow-soft",
                  )}
                >
                  <Image
                    src={AVATARS[i] ?? AVATARS[0]}
                    alt=""
                    width={44}
                    height={44}
                    className="size-11 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold uppercase tracking-wide">{d.name}</p>
                    <p className="truncate text-[13px] text-muted-foreground">{i === 0 ? d.note : d.place}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal>
          <div className="relative mx-auto w-full max-w-[460px]">
            <div aria-hidden className="absolute top-10 right-4 h-[78%] w-[88%] rounded-[28px] border border-line bg-white/70" />
            <div aria-hidden className="absolute top-16 right-0 h-[78%] w-[88%] rounded-[28px] border border-line bg-white/40" />
            <article className="relative overflow-hidden rounded-[28px] border border-line bg-white shadow-lift">
              <div className="relative h-[180px] overflow-hidden bg-surface-2">
                <Image
                  src="/landing/figma/footer-chantier.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="460px"
                />
                <span className="absolute top-3 right-3 rounded-pill bg-brand-orange px-2.5 py-1 text-[11px] font-semibold text-white">
                  {featured.status}
                </span>
              </div>
              <div className="p-5">
                <p className="font-display text-[22px] leading-tight font-semibold">{featured.name}</p>
                <p className="mt-1 text-[14px] text-muted-foreground">{featured.place}</p>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{featured.note}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-pill bg-surface-2 px-2.5 py-1 text-[12px]">{featured.trade}</span>
                  <span className="rounded-pill bg-surface-2 px-2.5 py-1 text-[12px]">{featured.supplier}</span>
                  <span className="rounded-pill bg-surface-2 px-2.5 py-1 text-[12px]">{featured.docs}</span>
                  <span className="rounded-pill bg-surface-2 px-2.5 py-1 text-[11px] uppercase">{DEMO_MARK}</span>
                </div>
              </div>
            </article>
          </div>
        </Reveal>
      </InView>
    </LandingSection>
  );
}
