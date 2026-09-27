import { existsSync } from "node:fs";
import { join } from "node:path";
import { ArrowDownRight, ArrowUpRight, HardHat } from "lucide-react";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { HeroBackdrop } from "@/components/site/hero-backdrop";
import { DeltaBadge } from "@/components/site/delta-badge";
import { LandingButton } from "@/components/site/landing-button";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { DEMO_MARK, HERO, HERO_SAMPLE, euro, variation } from "@/lib/site/tarineo";

/** L'image n'est utilisée que si le fichier existe dans /public (sinon : scène de chantier vectorielle). */
function publicFile(src: string | null) {
  if (!src) return null;
  return existsSync(join(process.cwd(), "public", src)) ? src : null;
}

/** Hero plein cadre : photo de chantier + voile 60 %, promesse, deux CTA, une ligne analysée en exemple. */
export function LandingHero() {
  const change = variation(HERO_SAMPLE.before, HERO_SAMPLE.after);
  const image = publicFile(HERO.image);

  return (
    <section
      id="top"
      className="relative isolate -mt-[72px] flex min-h-[min(100svh,980px)] scroll-mt-24 flex-col justify-center overflow-clip px-4 pt-[120px] pb-16 text-white sm:px-8 sm:pt-[140px] sm:pb-24"
    >
      <HeroBackdrop video={HERO.video} image={image} alt={HERO.imageAlt} />

      <RevealGroup
        stagger={0.1}
        delay={0.1}
        className="mx-auto flex w-full max-w-[1060px] flex-col items-center gap-5 text-center [text-shadow:0_1px_2px_rgba(0,0,0,0.35),0_2px_24px_rgba(0,0,0,0.45)] sm:gap-6"
      >
        <Reveal>
          <p className="liquid-glass inline-flex items-center gap-2 rounded-pill py-1.5 pr-3.5 pl-2.5 font-mono text-[10.5px] font-medium tracking-[0.08em] text-white uppercase [text-shadow:none] sm:text-[11px] sm:tracking-[0.12em]">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-[beacon_2.4s_ease-in-out_infinite] rounded-full bg-brand-orange/60 blur-[3px] motion-reduce:hidden" />
              <span className="relative size-2 rounded-full bg-brand-orange" />
            </span>
            {HERO.badge}
          </p>
        </Reveal>

        <Reveal>
          <h1 className="font-display text-[clamp(36px,8.4vw,80px)] leading-[1.0] font-semibold tracking-tightest text-balance">
            {HERO.title}
            <br />
            {HERO.titleTail}
          </h1>
        </Reveal>

        <Reveal>
          <p className="max-w-[58ch] text-[16px] leading-relaxed font-medium text-white sm:text-[19px]">{HERO.text}</p>
        </Reveal>

        <Reveal className="flex w-full max-w-[min(100%,360px)] flex-col gap-2.5 sm:max-w-none sm:flex-row sm:justify-center sm:gap-3">
          <LandingButton
            href={HERO.primary.href}
            variant="orange"
            icon={<ArrowUpRight aria-hidden />}
            fullWidth
            className="sm:w-auto"
          >
            {HERO.primary.label}
          </LandingButton>
          <LandingButton
            href={HERO.secondary.href}
            variant="glass"
            icon={<ArrowDownRight aria-hidden />}
            fullWidth
            prefetch={false}
            className="sm:w-auto"
          >
            {HERO.secondary.label}
          </LandingButton>
        </Reveal>

        <Reveal>
          <p className="flex items-center justify-center gap-2 text-[15px] font-medium text-white sm:text-base">
            <HardHat className="size-4 text-brand-orange-light" aria-hidden />
            {HERO.founderLine}
          </p>
        </Reveal>

        {/* Exemple de ligne analysée : le produit compris en un coup d'œil */}
        <Reveal className="mt-4 w-full max-w-[640px] sm:mt-8">
          <figure className="liquid-glass rounded-[20px] border border-white/20 bg-black/55! p-2 text-left [text-shadow:none]">
            <div className="flex items-center justify-between gap-3 px-3 pt-1.5 pb-2.5">
              <p className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.12em] text-white/75 uppercase">
                <SupplierLogo name={HERO_SAMPLE.supplier} size={22} priority className="rounded-md" />
                {HERO_SAMPLE.supplier} · Devis analysé
              </p>
              <span className="rounded-pill border border-white/20 px-2 py-0.5 font-mono text-[9.5px] tracking-[0.12em] text-white/70 uppercase">
                {DEMO_MARK}
              </span>
            </div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 rounded-[14px] border border-white/10 bg-white/[0.06] px-4 py-3.5 sm:grid-cols-[1fr_auto_auto]">
              <p className="text-[15px] font-medium text-white">{HERO_SAMPLE.product}</p>
              <p className="order-3 col-span-2 flex items-center gap-2 font-mono text-[13px] text-white/70 tabular-nums sm:order-none sm:col-span-1">
                <span className="line-through decoration-white/50">{euro(HERO_SAMPLE.before)}</span>
                <span aria-hidden>→</span>
                <span className="text-white">{euro(HERO_SAMPLE.after)}</span>
              </p>
              <DeltaBadge value={change} size="lg" solid />
            </div>
            <figcaption className="sr-only">
              Exemple : {HERO_SAMPLE.product} passe de {euro(HERO_SAMPLE.before)} à {euro(HERO_SAMPLE.after)}.
            </figcaption>
          </figure>
        </Reveal>
      </RevealGroup>
    </section>
  );
}
