import { ArrowDown, Bot, FileText, FolderOpen, Mail, MoreHorizontal, Phone } from "lucide-react";
import Image from "next/image";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { LandingButton } from "@/components/site/landing-button";
import { LandingCircuit } from "@/components/site/landing-circuit";
import { OFFER, CTA_TRIAL, CHANTIER_DOSSIERS, DEMO_MARK, HERO, HERO_PANELS } from "@/lib/site/tarineo";

const AVATARS = [
  "/landing/figma/avatar-1.jpg",
  "/landing/figma/avatar-2.jpg",
  "/landing/figma/avatar-3.jpg",
] as const;

/** Hero clair Figma : titre, CTA produit, 4 cartes, circuits orange. */
export function LandingHero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-clip px-4 pt-6 pb-10 sm:px-8 sm:pt-8 sm:pb-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:repeating-linear-gradient(135deg,#111_0_1px,transparent_1px_14px)]"
      />
      <LandingCircuit />

      <RevealGroup
        stagger={0.08}
        delay={0.05}
        className="relative mx-auto flex w-full max-w-[1180px] flex-col items-center text-center"
      >
        <Reveal>
          <p className="mb-6 inline-flex items-center gap-2 rounded-pill border border-line bg-white py-1 pr-1 pl-2.5 text-[13px] shadow-soft">
            <span className="text-muted-foreground">Alertes prix · artisans BTP</span>
            <a
              href="/inscription"
              className="inline-flex items-center gap-1 rounded-pill bg-ink px-3 py-1.5 text-[12.5px] font-semibold text-white"
            >
              Importez un devis
            </a>
          </p>
        </Reveal>

        <Reveal>
          <h1 className="max-w-[18ch] font-display text-[clamp(34px,5.6vw,64px)] leading-[1.08] font-semibold tracking-tight text-balance">
            {HERO.title}
            <br />
            <span className="text-brand-orange">{HERO.titleTail}</span>
          </h1>
        </Reveal>

        <Reveal>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground sm:text-[17px]">{HERO.text}</p>
        </Reveal>

        <Reveal className="mt-6 flex w-full max-w-[360px] flex-col gap-2.5 sm:max-w-none sm:flex-row sm:justify-center sm:gap-3">
          <LandingButton href={HERO.primary.href} variant="orange" fullWidth className="sm:w-auto">
            {CTA_TRIAL.long}
          </LandingButton>
          <LandingButton href="/#contact" variant="pillWhite" fullWidth prefetch={false} className="sm:w-auto">
            Nous contacter
          </LandingButton>
        </Reveal>

        <Reveal className="mt-4 hidden md:grid">
          <span className="grid size-8 place-items-center rounded-full border border-line bg-white text-muted-foreground shadow-soft">
            <ArrowDown className="size-4" aria-hidden />
          </span>
        </Reveal>

        <Reveal className="mt-8 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          <HeroCard title={HERO_PANELS[0].title}>
            <div className="relative mx-auto mt-3 flex h-[168px] w-full max-w-[220px] items-center justify-center rounded-[22px] bg-[linear-gradient(180deg,#ffd4b8_0%,#ec5821_100%)]">
              <div className="w-[78%] rounded-2xl bg-white p-3 text-left shadow-lift">
                <p className="text-[11px] font-medium text-muted-foreground">Devis fournisseur</p>
                <p className="mt-2 rounded-lg bg-brand-orange px-2 py-1.5 text-[11px] font-semibold text-white">
                  Transformer en devis client
                </p>
              </div>
            </div>
            <p className="mt-3 text-[13px] text-muted-foreground">{HERO_PANELS[0].text}</p>
          </HeroCard>

          <HeroCard title={HERO_PANELS[1].title}>
            <div className="mx-auto mt-4 grid size-16 place-items-center overflow-hidden rounded-full bg-alert-wash ring-4 ring-white">
              <Image src="/landing/figma/mascotte.jpg" alt="" width={64} height={64} className="size-16 object-cover" />
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[15px] font-semibold">
              <Bot className="size-4 text-brand-orange" aria-hidden />
              Copilote
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{HERO_PANELS[1].text}</p>
          </HeroCard>

          <HeroCard title={HERO_PANELS[2].title}>
            <div className="mx-auto mt-4 grid size-16 place-items-center rounded-2xl bg-alert-wash">
              <FileText className="size-7 text-brand-orange" aria-hidden />
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-alert-wash px-3 py-1 text-[13px] font-semibold text-brand-orange">
              <FolderOpen className="size-3.5" aria-hidden />
              Pièces rattachées
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{HERO_PANELS[2].text}</p>
          </HeroCard>

          <HeroCard title={HERO_PANELS[3].title}>
            <ul className="mt-2 flex flex-col divide-y divide-line text-left">
              {CHANTIER_DOSSIERS.map((d, i) => (
                <li key={d.name} className="flex items-center gap-2.5 py-2.5">
                  <Image
                    src={AVATARS[i] ?? AVATARS[0]}
                    alt=""
                    width={36}
                    height={36}
                    className="size-9 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{d.name}</p>
                    <p className="truncate text-[12px] text-muted-foreground">{d.place}</p>
                  </div>
                  <span className="rounded-pill bg-[#e8f7ee] px-2 py-0.5 text-[11px] font-semibold text-[#166534]">
                    {d.status}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-1 flex justify-end gap-2 text-muted-foreground">
              <Mail className="size-3.5" aria-hidden />
              <Phone className="size-3.5" aria-hidden />
              <MoreHorizontal className="size-3.5" aria-hidden />
            </div>
          </HeroCard>
        </Reveal>

        <Reveal>
          <p className="mt-6 text-[13px] text-muted-foreground">
            {OFFER}. <span className="sr-only">{DEMO_MARK}</span>
          </p>
        </Reveal>
      </RevealGroup>
    </section>
  );
}

function HeroCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[28px] border border-line bg-white p-4 text-center shadow-soft">
      <p className="text-[13px] font-medium text-ink">{title}</p>
      {children}
    </article>
  );
}
