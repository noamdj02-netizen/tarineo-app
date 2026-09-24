import { ArrowRight } from "lucide-react";
import { Mascot } from "@/components/mascot";
import { Reveal } from "@/components/motion/reveal";
import { LandingButton } from "@/components/site/landing-button";
import { InView } from "@/components/site/in-view";
import { Card, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { PRO_TRIAL_DAYS } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

/** Bandeau intermédiaire sous le hero. */
export function LandingCtaBand() {
  return (
    <section className="border-y border-line bg-surface px-4 py-10 sm:px-8 sm:py-14">
      <InView className="mx-auto max-w-[1080px]">
        <Card className="flex-col gap-0 rounded-[20px] border-line py-0 shadow-soft ring-1 ring-line sm:rounded-[24px] sm:flex-row sm:items-center">
          <div className="hidden shrink-0 pl-(--card-spacing) pt-2 sm:block">
            <Mascot name="06-casque-focus" className="h-20 w-[8.5rem]" label="On avance ensemble" />
          </div>
          <div className="flex flex-1 flex-col gap-2 border-0 px-4 pt-5 pb-3 text-center sm:px-6 sm:py-6 sm:pb-6 sm:text-left">
            <p className="mono-label">/ Focus ///</p>
            <CardTitle className="font-display text-[clamp(22px,5.5vw,32px)] font-semibold tracking-tightest text-balance">
              Arrête de jongler entre dix onglets.
            </CardTitle>
            <CardDescription className="mx-auto max-w-[46ch] text-[15px] leading-relaxed sm:mx-0">
              Choisis ton Focus, pose une question au copilote et avance avant la fin de la journée.
            </CardDescription>
            <div className="mx-auto mt-1 shrink-0 sm:hidden">
              <Mascot name="06-casque-focus" className="h-16 w-[7rem]" label="On avance ensemble" />
            </div>
          </div>
          <CardFooter className="shrink-0 border-0 bg-transparent px-4 pb-5 sm:px-8 sm:pb-6">
            <LandingButton href="/inscription?plan=pro" icon={<ArrowRight aria-hidden />} fullWidth className="sm:w-auto sm:max-w-none">
              Essai gratuit {PRO_TRIAL_DAYS} jours
            </LandingButton>
          </CardFooter>
        </Card>
      </InView>
    </section>
  );
}

type LandingClosingCtaProps = {
  className?: string;
};

/** CTA final sombre — aligné sur la carte Pro de /prix. */
export function LandingClosingCta({ className }: LandingClosingCtaProps) {
  return (
    <section className={cn("px-4 pb-16 sm:px-8 sm:pb-20", className)}>
      <InView className="mx-auto max-w-[1080px]">
        <Card
          className="relative isolate gap-0 overflow-clip rounded-[22px] border-0 bg-ink py-0 text-accent-ink shadow-lift ring-1 ring-accent-ink/15 sm:rounded-[28px]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_0%,transparent_100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-[12%] bottom-0 h-[70%] w-[55%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-glow-2)_28%,transparent)_0%,transparent_70%)] opacity-80 blur-3xl"
          />

          <div className="relative grid lg:grid-cols-[minmax(0,1fr)_minmax(220px,300px)]">
            <div className="flex flex-col items-center gap-3 border-b border-accent-ink/10 px-6 pt-10 pb-8 text-center sm:px-10 sm:pt-12 lg:items-start lg:border-b-0 lg:border-r lg:pb-10 lg:text-left">
              <Reveal>
                <p className="mono-label text-accent-ink/55">/ Démarrer ///</p>
              </Reveal>
              <Reveal>
                <CardTitle className="font-display text-[clamp(28px,4.6vw,46px)] leading-[1.04] font-semibold tracking-tightest text-balance text-accent-ink">
                  Prêt à lancer ton prochain projet ?
                </CardTitle>
              </Reveal>
              <Reveal>
                <CardDescription className="max-w-[48ch] text-base leading-relaxed text-accent-ink/70 lg:mx-0">
                  {PRO_TRIAL_DAYS} jours d’essai Pro sans carte. Crée ton compte, ajoute tes projets et choisis ton
                  Focus.
                </CardDescription>
              </Reveal>

              <Reveal className="mt-2 flex w-full justify-center lg:hidden">
                <ClosingCtaMascotPanel className="max-w-[min(100%,320px)]" />
              </Reveal>
            </div>

            <div className="relative hidden items-end justify-center overflow-hidden px-4 pt-8 pb-2 lg:flex">
              <ClosingCtaMascotPanel className="h-full min-h-[200px] w-full" />
            </div>
          </div>

          <CardFooter
            className="relative flex w-full flex-col items-stretch justify-center gap-3 border-t border-accent-ink/10 bg-accent-ink/[0.04] px-4 py-7 sm:flex-row sm:items-center sm:px-6 sm:py-9"
          >
            <Reveal className="w-full sm:w-auto">
              <LandingButton
                href="/inscription?plan=pro"
                variant="inverse"
                icon={<ArrowRight aria-hidden />}
                fullWidth
                className="sm:w-auto sm:min-w-[240px]"
              >
                Commencer l’essai gratuit
              </LandingButton>
            </Reveal>
            <Reveal className="w-full sm:w-auto">
              <LandingButton
                href="/#prix"
                variant="secondary"
                fullWidth
                className="border-accent-ink/25 bg-accent-ink/10 text-accent-ink hover:bg-accent-ink/20 sm:w-auto sm:min-w-[240px]"
              >
                Voir les prix
              </LandingButton>
            </Reveal>
          </CardFooter>
        </Card>
      </InView>
    </section>
  );
}

function ClosingCtaMascotPanel({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex w-full items-end justify-center overflow-hidden rounded-[20px]",
        "border border-white/10 bg-[linear-gradient(165deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.04)_48%,rgba(255,255,255,0.02)_100%)]",
        "px-3 pt-8 pb-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[5%] top-[8%] h-[75%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-glow-1)_55%,transparent)_0%,transparent_72%)] opacity-90 blur-2xl"
      />
      <Mascot
        name="08-croissance"
        label="Commencer"
        className="relative z-[1] h-[7.5rem] w-[12.5rem] sm:h-[8.25rem] sm:w-[13.5rem]"
      />
    </div>
  );
}
