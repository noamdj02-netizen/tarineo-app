import { ArrowRight, Check } from "lucide-react";
import { Mascot } from "@/components/mascot";
import { Reveal } from "@/components/motion/reveal";
import { LandingButton } from "@/components/site/landing-button";
import { InView } from "@/components/site/in-view";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PRO_TRIAL_DAYS } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

const CLOSING_POINTS = [
  `${PRO_TRIAL_DAYS} jours d’essai Pro, sans carte`,
  "Un projet en Focus, la prochaine action visible",
  "Tes fichiers restent à toi",
] as const;

/** Bandeau intermédiaire sous le hero. */
export function LandingCtaBand() {
  return (
    <section className="border-y border-line bg-surface px-4 py-10 sm:px-8 sm:py-14">
      <InView className="mx-auto max-w-[1080px]">
        <Card className="flex-col gap-0 rounded-[20px] border-line py-0 shadow-soft ring-1 ring-line sm:rounded-[24px] sm:flex-row sm:items-center">
          <CardContent className="hidden shrink-0 pt-2 sm:block">
            <Mascot name="06-casque-focus" className="h-20 w-[8.5rem]" label="On avance ensemble" />
          </CardContent>
          <CardHeader className="flex-1 gap-2 border-0 px-4 pt-5 pb-3 text-center sm:px-6 sm:py-6 sm:text-left">
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
          </CardHeader>
          <CardFooter className="shrink-0 border-0 bg-transparent px-4 pb-5 sm:px-8 sm:pb-6">
            <LandingButton href="/inscription?plan=pro" icon={<ArrowRight data-icon="inline-end" aria-hidden />} fullWidth className="sm:w-auto sm:max-w-none">
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
    <section className={cn("px-4 pb-4 sm:px-8 sm:pb-6", className)}>
      <InView className="mx-auto max-w-[1080px]">
        <Card className="relative isolate gap-0 overflow-clip rounded-[22px] border-0 bg-ink py-0 text-accent-ink shadow-lift ring-1 ring-accent-ink/15 sm:rounded-[28px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_0%,transparent_100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-[12%] bottom-0 h-[70%] w-[55%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-glow-2)_28%,transparent)_0%,transparent_70%)] opacity-80 blur-3xl"
          />

          <div className="relative grid lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)]">
            <CardHeader className="items-center gap-4 px-6 pt-10 pb-8 text-center sm:px-10 sm:pt-12 lg:items-start lg:border-r lg:border-accent-ink/10 lg:pb-12 lg:text-left">
              <Reveal>
                <p className="mono-label text-accent-ink/55">/ Démarrer ///</p>
              </Reveal>
              <Reveal>
                <CardTitle className="font-display text-[clamp(28px,4.8vw,46px)] leading-[1.04] font-semibold tracking-tightest text-balance text-accent-ink">
                  Prêt à lancer ton prochain projet ?
                </CardTitle>
              </Reveal>
              <Reveal>
                <CardDescription className="max-w-[44ch] text-base leading-relaxed text-accent-ink/70">
                  {PRO_TRIAL_DAYS} jours d’essai Pro sans carte. Crée ton compte, ajoute tes projets et
                  choisis ton Focus.
                </CardDescription>
              </Reveal>
              <Reveal>
                <ul className="flex flex-col gap-2 text-left text-[14px] text-accent-ink/75">
                  {CLOSING_POINTS.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent-ink/55" aria-hidden />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:pt-1">
                <LandingButton
                  href="/inscription?plan=pro"
                  variant="inverse"
                  icon={<ArrowRight data-icon="inline-end" aria-hidden />}
                  fullWidth
                  className="sm:w-auto sm:min-w-[220px]"
                >
                  Commencer l’essai gratuit
                </LandingButton>
                <LandingButton
                  href="/#prix"
                  variant="secondary"
                  fullWidth
                  className="border-accent-ink/20 bg-accent-ink/10 text-accent-ink hover:bg-accent-ink/18 sm:w-auto sm:min-w-[160px]"
                >
                  Voir les prix
                </LandingButton>
              </Reveal>
            </CardHeader>

            <CardContent className="relative hidden items-end justify-center overflow-hidden px-4 pt-8 pb-4 lg:flex">
              <ClosingCtaMascotPanel className="h-full min-h-[240px] w-full" />
            </CardContent>
          </div>
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
        "border border-accent-ink/10 bg-accent-ink/[0.06]",
        "px-3 pt-8 pb-1 shadow-dark",
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
