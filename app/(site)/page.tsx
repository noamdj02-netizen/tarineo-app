import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Illustration } from "@/components/illustration";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { Faq } from "@/components/site/faq";
import { InView } from "@/components/site/in-view";
import { Pricing } from "@/components/site/pricing";
import { ProductPreview } from "@/components/site/product-preview";
import { BRAND } from "@/lib/brand";
import { FAQ, FEATURES, STEPS } from "@/lib/site/content";

export const metadata = {
  title: { absolute: `${BRAND.name} · Le cockpit des fondateurs solo` },
  description: BRAND.description,
};

const PROOF = ["Gratuit pour commencer", "Sans carte bancaire", "Tes données restent à toi"];

function SectionHead({ label, title, tail, text }: { label: string; title: string; tail?: string; text?: string }) {
  return (
    <InView className="mx-auto mb-10 flex max-w-[640px] flex-col items-center gap-3 text-center">
      <Reveal>
        <p className="mono-label">{`/ ${label} ///`}</p>
      </Reveal>
      <Reveal>
        <h2 className="font-display text-[clamp(28px,4.4vw,42px)] leading-[1.05] font-semibold tracking-tightest text-balance">
          {title}
          {tail ? <span className="text-accent-2"> {tail}</span> : null}
        </h2>
      </Reveal>
      {text ? (
        <Reveal>
          <p className="text-[16px] leading-relaxed text-muted">{text}</p>
        </Reveal>
      ) : null}
    </InView>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-clip px-5 pt-14 pb-10 sm:px-8 sm:pt-24">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[38%] -z-10 h-[70%]">
          <div className="absolute left-[4%] h-full w-[46%] animate-[glow-drift_18s_ease-in-out_infinite] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-1)_10%,transparent)] opacity-70 blur-3xl" />
          <div className="absolute left-[30%] h-full w-[42%] animate-[glow-drift_22s_ease-in-out_-7s_infinite] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-2)_10%,transparent)] opacity-70 blur-3xl" />
          <div className="absolute right-[4%] h-full w-[44%] animate-[glow-drift_26s_ease-in-out_-12s_infinite] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-3)_10%,transparent)] opacity-70 blur-3xl" />
        </div>

        <RevealGroup className="mx-auto flex max-w-[860px] flex-col items-center gap-6 text-center">
          <Reveal>
            <Link
              href="/prix"
              className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface py-1 pr-3 pl-1 text-[13px] text-ink/80 shadow-soft transition-colors hover:text-ink"
            >
              <span className="rounded-pill bg-ink px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] text-accent-ink uppercase">
                Nouveau
              </span>
              Un prix qui baisse chaque année où tu restes
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </Reveal>
          <Reveal>
            <h1 className="font-display text-[clamp(40px,7.4vw,76px)] leading-[0.98] font-semibold tracking-tightest text-balance">
              Tous tes projets. <span className="text-accent-2">Un seul en Focus.</span>
            </h1>
          </Reveal>
          <Reveal>
            <p className="max-w-[56ch] text-[17px] leading-relaxed text-muted sm:text-[18px]">
              Navpit range tes side-projects, te montre la prochaine action et t’aide à la faire avec un
              copilote IA qui connaît tout. Jusqu’à ta première vente.
            </p>
          </Reveal>
          <Reveal className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/inscription"
              className="btn-dark inline-flex min-h-12 items-center gap-2 rounded-pill px-6 text-[15px] font-medium"
            >
              Commencer gratuitement
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="#fonctions"
              className="inline-flex min-h-12 items-center rounded-pill border border-line bg-surface px-6 text-[15px] font-medium shadow-soft transition-transform duration-300 ease-out-soft hover:-translate-y-0.5"
            >
              Voir les fonctions
            </Link>
          </Reveal>
          <Reveal>
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13.5px] text-muted">
              {PROOF.map((p) => (
                <li key={p} className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-st-focus" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </RevealGroup>

        <RevealGroup delay={0.35} className="mx-auto mt-14 max-w-[1080px]">
          <Reveal>
            <ProductPreview />
          </Reveal>
        </RevealGroup>
      </section>

      {/* Fonctions */}
      <section id="fonctions" className="scroll-mt-24 px-5 py-20 sm:px-8">
        <SectionHead
          label="Fonctions"
          title="Tout ce qu’il faut pour lancer,"
          tail="au même endroit."
          text="Fini les onglets Notion, Figma, ChatGPT et agenda éparpillés : Navpit réunit tout autour de tes projets."
        />
        <InView className="mx-auto grid max-w-[1080px] gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
          {FEATURES.map((f) => (
            <Reveal
              key={f.title}
              className="flex flex-col gap-3 rounded-[22px] border border-line bg-surface p-6 shadow-soft"
            >
              <Illustration name={f.art} className="-mt-1 -ml-1 size-16" />
              <h3 className="text-[18px] font-semibold tracking-[-0.02em]">{f.title}</h3>
              <p className="text-[14.5px] leading-relaxed text-muted">{f.text}</p>
            </Reveal>
          ))}
        </InView>
      </section>

      {/* Comment ça marche */}
      <section id="comment" className="scroll-mt-24 bg-bg px-5 py-20 sm:px-8">
        <SectionHead label="Comment ça marche" title="Trois étapes," tail="et tu avances." />
        <InView className="mx-auto grid max-w-[1080px] gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} className="flex flex-col gap-3 rounded-[22px] bg-surface p-6 shadow-soft">
              <span className="font-mono text-[12px] font-medium tracking-[0.1em] text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[18px] font-semibold tracking-[-0.02em]">{s.title}</h3>
              <p className="text-[14.5px] leading-relaxed text-muted">{s.text}</p>
            </Reveal>
          ))}
        </InView>
      </section>

      {/* Mot du fondateur (à la place de faux témoignages) */}
      <section className="px-5 py-20 sm:px-8">
        <InView className="mx-auto flex max-w-[760px] flex-col items-center gap-6 text-center">
          <Reveal>
            <Illustration name="landing-idee" className="size-20" />
          </Reveal>
          <Reveal>
            <blockquote className="font-serif text-[clamp(24px,3.6vw,34px)] leading-[1.25] text-balance italic">
              « J’avais dix projets ouverts et aucun ne sortait. Navpit, c’est la règle que je me suis
              imposée : un seul en Focus, jusqu’à la première vente. »
            </blockquote>
          </Reveal>
          <Reveal>
            <p className="mono-label">Noam · Créateur de Navpit</p>
          </Reveal>
        </InView>
      </section>

      {/* Prix */}
      <section id="prix" className="scroll-mt-24 bg-bg px-5 py-20 sm:px-8">
        <SectionHead
          label="Prix"
          title="Plus tu restes,"
          tail="moins tu paies."
          text="Commence gratuitement. En Pro, ton prix baisse à chaque anniversaire d’abonnement."
        />
        <div className="mx-auto max-w-[1080px]">
          <Pricing />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 px-5 py-20 sm:px-8">
        <SectionHead label="FAQ" title="Questions fréquentes" />
        <div className="mx-auto max-w-[720px]">
          <Faq items={FAQ} />
        </div>
      </section>

      {/* Appel final */}
      <section className="px-5 pb-20 sm:px-8">
        <InView className="relative isolate mx-auto flex max-w-[1080px] flex-col items-center gap-5 overflow-clip rounded-[28px] bg-ink px-6 py-16 text-center text-accent-ink shadow-lift">
          <Reveal>
            <h2 className="font-display text-[clamp(28px,4.6vw,46px)] leading-[1.04] font-semibold tracking-tightest text-balance">
              Prêt à lancer ton prochain projet ?
            </h2>
          </Reveal>
          <Reveal>
            <p className="max-w-[48ch] text-[16px] leading-relaxed text-accent-ink/70">
              Crée ton compte en une minute, ajoute tes projets et choisis ton Focus.
            </p>
          </Reveal>
          <Reveal>
            <Link
              href="/inscription"
              className="inline-flex min-h-12 items-center gap-2 rounded-pill bg-accent-ink px-6 text-[15px] font-medium text-ink transition-transform duration-300 ease-out-soft hover:-translate-y-0.5"
            >
              Commencer gratuitement
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Reveal>
        </InView>
      </section>
    </>
  );
}
