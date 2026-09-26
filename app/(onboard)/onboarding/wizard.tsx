"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { CockpitScreen, COCKPIT_PRESETS } from "@/components/onboarding/screens/cockpit-screen";
import { GoalScreen } from "@/components/onboarding/screens/goal-screen";
import { IdentiteScreen } from "@/components/onboarding/screens/identite-screen";
import { PainScreen } from "@/components/onboarding/screens/pain-screen";
import { PaywallScreen } from "@/components/onboarding/screens/paywall-screen";
import { ProcessScreen } from "@/components/onboarding/screens/process-screen";
import { ProjetScreen } from "@/components/onboarding/screens/projet-screen";
import { ProofScreen } from "@/components/onboarding/screens/proof-screen";
import { SolutionScreen } from "@/components/onboarding/screens/solution-screen";
import { SwipeScreen } from "@/components/onboarding/screens/swipe-screen";
import { WelcomeScreen } from "@/components/onboarding/screens/welcome-screen";
import { WizardStepBg } from "@/components/onboarding/wizard-step-bg";
import { EASE } from "@/components/motion/reveal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { WidgetKey } from "@/lib/home/dashboard-prefs";
import type { Locale } from "@/lib/i18n";
import { ONBOARD_STEPS, ONBOARD_SWIPES, type OnboardGoalId, type OnboardPainId } from "@/lib/onboarding/catalog";
import type { TrendAppId } from "@/lib/onboarding/trend-apps";
import { cn } from "@/lib/utils";
import {
  chooseProject,
  createProjectFromIdea,
  finishOnboarding,
  saveCockpit,
  saveOnboardingAnswers,
  saveWelcome,
  type OnboardProject,
} from "./actions";

export function Wizard({
  firstName,
  lastName,
  locale,
  avatarUrl,
  initial,
  projects,
  next,
  ask,
  startStep = 0,
}: {
  firstName: string;
  lastName: string;
  locale: Locale;
  avatarUrl: string | null;
  initial: string;
  projects: OnboardProject[];
  next?: string;
  ask?: string;
  startStep?: number;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(startStep);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(firstName);
  const [family, setFamily] = useState(lastName);
  const [lang, setLang] = useState<Locale>(locale);
  const [goal, setGoal] = useState<OnboardGoalId | undefined>();
  const [pains, setPains] = useState<OnboardPainId[]>([]);
  const [swipes, setSwipes] = useState<boolean[]>([]);
  const [chosenId, setChosenId] = useState<string | null>(
    projects.find((p) => p.status === "focus")?.id ?? null,
  );
  const [ideaId, setIdeaId] = useState<TrendAppId | null>(null);
  const [customName, setCustomName] = useState("");
  const [preset, setPreset] = useState("focus");
  const [widgets, setWidgets] = useState<Record<WidgetKey, boolean>>(COCKPIT_PRESETS[0].widgets);

  const last = ONBOARD_STEPS.length - 1;
  const hideFooter = step === 0 || step === 7 || step === last;

  function go(fn: () => Promise<void>) {
    setError(null);
    start(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Une erreur est arrivée.");
      }
    });
  }

  const onProcessDone = useCallback(() => {
    setStep((s) => (s === 7 ? 8 : s));
  }, []);

  const dest = ask ? `/accueil?ask=${encodeURIComponent(ask)}` : (next ?? "/accueil");

  async function advance() {
    if (step === 1) {
      const res = await saveWelcome(name, lang, family);
      if (!res.ok) throw new Error(res.error);
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!goal) throw new Error("Choisis un objectif.");
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!pains.length) throw new Error("Coche au moins un frein.");
      setStep(4);
      return;
    }
    if (step === 4) {
      setStep(5);
      return;
    }
    if (step === 5) {
      if (swipes.length < ONBOARD_SWIPES.length) throw new Error("Réponds aux trois cartes.");
      const res = await saveOnboardingAnswers({ goal, pains, swipes });
      if (!res.ok) throw new Error(res.error);
      setStep(6);
      return;
    }
    if (step === 6) {
      setStep(7);
      return;
    }
    if (step === 8) {
      const custom = customName.trim();
      if (custom.length >= 2) {
        const res = await createProjectFromIdea(ideaId ?? "sdr", custom);
        if (!res.ok) throw new Error(res.error);
      } else if (chosenId) {
        const res = await chooseProject(chosenId);
        if (!res.ok) throw new Error(res.error);
      } else if (ideaId) {
        const res = await createProjectFromIdea(ideaId);
        if (!res.ok) throw new Error(res.error);
      } else {
        throw new Error("Choisis un projet, une idée, ou un nom.");
      }
      setStep(9);
      return;
    }
    if (step === 9) {
      const res = await saveCockpit({ widgets });
      if (!res.ok) throw new Error(res.error);
      setStep(10);
    }
  }

  async function enterCockpit() {
    const res = await finishOnboarding();
    if (!res.ok) throw new Error(res.error);
    router.replace(dest);
    router.refresh();
  }

  const stepMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 16, filter: "blur(6px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: -10, filter: "blur(4px)" },
        transition: { duration: 0.45, ease: EASE },
      };

  return (
    <div className="relative grid h-full min-h-0 flex-1 grid-rows-[auto_auto_minmax(0,1fr)]">
      <WizardStepBg step={step} />

      <div className="mb-3 flex items-center gap-3 px-0.5">
        <div
          className="flex min-w-0 flex-1 gap-1"
          aria-label={`Étape ${step + 1} sur ${ONBOARD_STEPS.length}`}
        >
          {ONBOARD_STEPS.map((s, i) => (
            <motion.i
              key={s.id}
              layout
              className={cn("h-1 flex-1 rounded-pill", i <= step ? "bg-ink" : "bg-ink/12")}
              transition={{ duration: 0.35, ease: EASE }}
            />
          ))}
        </div>
        <p className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
          {step + 1}/{ONBOARD_STEPS.length}
        </p>
      </div>
      <p className="mono-label mb-3 px-0.5">{`/ ${ONBOARD_STEPS[step]?.label ?? ""} ///`}</p>

      <Card className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-0 overflow-hidden border-line bg-surface/90 py-0 shadow-soft ring-1 ring-line lg:rounded-card">
        <CardContent className="min-h-0 overflow-y-auto overscroll-contain px-4 py-5 sm:px-8 sm:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              className="flex min-h-full flex-col"
              initial={stepMotion.initial}
              animate={stepMotion.animate}
              exit={stepMotion.exit}
              transition={stepMotion.transition}
            >
              {step === 0 ? <WelcomeScreen onStart={() => setStep(1)} /> : null}
              {step === 1 ? (
                <IdentiteScreen
                  first={name}
                  last={family}
                  lang={lang}
                  onFirst={setName}
                  onLast={setFamily}
                  onLang={setLang}
                />
              ) : null}
              {step === 2 ? <GoalScreen value={goal} onChange={setGoal} /> : null}
              {step === 3 ? (
                <PainScreen
                  value={pains}
                  onToggle={(id) =>
                    setPains((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
                  }
                />
              ) : null}
              {step === 4 ? <ProofScreen /> : null}
              {step === 5 ? (
                <SwipeScreen
                  answers={swipes}
                  onAnswer={(_i, yes) => setSwipes((cur) => [...cur, yes])}
                />
              ) : null}
              {step === 6 ? <SolutionScreen goal={goal} pains={pains} /> : null}
              {step === 7 ? <ProcessScreen onDone={onProcessDone} /> : null}
              {step === 8 ? (
                <ProjetScreen
                  existing={projects}
                  chosenId={chosenId}
                  ideaId={ideaId}
                  customName={customName}
                  onChooseExisting={(id) => {
                    setChosenId(id);
                    setIdeaId(null);
                    setCustomName("");
                  }}
                  onIdea={(id) => {
                    setIdeaId(id);
                    setChosenId(null);
                    setCustomName("");
                  }}
                  onCustom={(v) => {
                    setCustomName(v);
                    setChosenId(null);
                    setIdeaId(null);
                  }}
                />
              ) : null}
              {step === 9 ? (
                <CockpitScreen
                  avatarUrl={avatarUrl}
                  initial={initial}
                  preset={preset}
                  widgets={widgets}
                  onPreset={(id, nextWidgets) => {
                    setPreset(id);
                    setWidgets(nextWidgets);
                  }}
                  onToggle={(key) =>
                    setWidgets((w) => ({ ...w, [key]: !w[key] }))
                  }
                />
              ) : null}
              {step === 10 ? (
                <PaywallScreen pending={pending} onEnter={() => go(enterCockpit)} />
              ) : null}
            </motion.div>
          </AnimatePresence>

          {error ? (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>

        {!hideFooter ? (
          <CardFooter className="shrink-0 gap-2 border-line bg-surface/95 px-4 py-3 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              className="min-h-11"
              disabled={step === 0 || pending}
              onClick={() => {
                setError(null);
                setStep((s) => Math.max(0, s - 1));
              }}
            >
              <ArrowLeft data-icon="inline-start" aria-hidden />
              Retour
            </Button>
            <Button
              type="button"
              className="ml-auto min-h-11"
              disabled={pending}
              onClick={() => go(advance)}
            >
              {pending ? <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden /> : null}
              Continuer
              {!pending ? <ArrowRight data-icon="inline-end" aria-hidden /> : null}
            </Button>
          </CardFooter>
        ) : step > 0 ? (
          <CardFooter className="shrink-0 justify-start border-line bg-transparent px-4 py-2 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 px-0"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              <ArrowLeft data-icon="inline-start" aria-hidden />
              Retour
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}
