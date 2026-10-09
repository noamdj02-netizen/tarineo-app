"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { IdentiteScreen } from "@/components/onboarding/screens/identite-screen";
import { OnboardingPdfStep } from "@/components/onboarding/screens/onboarding-pdf-step";
import { WizardStepBg } from "@/components/onboarding/wizard-step-bg";
import { POP_PAGE } from "@/components/motion/pop";
import { SuccessPop, SuccessPopOverlay } from "@/components/motion/success-pop";
import { EASE } from "@/components/motion/reveal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n";
import { ONBOARD_STEPS } from "@/lib/onboarding/catalog";
import type { ChantierCard, Party } from "@/lib/metier/types";
import { cn } from "@/lib/utils";
import { finishOnboarding, saveOnboardingStep, saveWelcome } from "./actions";

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

const PDF_STEP = 1;
const FIN_STEP = 2;

export function Wizard({
  firstName,
  lastName,
  locale,
  chantiers,
  clients = [],
  next,
  ask,
  startStep = 0,
  hasInboundDoc = false,
}: {
  firstName: string;
  lastName: string;
  locale: Locale;
  email: string;
  chantiers: ChantierCard[];
  clients?: Party[];
  next?: string;
  ask?: string;
  startStep?: number;
  hasInboundDoc?: boolean;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(Math.min(startStep, ONBOARD_STEPS.length - 1));
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(firstName);
  const [family, setFamily] = useState(lastName);
  const [lang, setLang] = useState<Locale>(locale);
  const [imported, setImported] = useState(hasInboundDoc);
  const [celebrate, setCelebrate] = useState<{ title: string; hint: string } | null>(null);
  const celebrateGen = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      celebrateGen.current += 1;
    };
  }, []);

  const hideFooter = step === PDF_STEP || step === FIN_STEP;
  const dest = ask ? `/accueil?ask=${encodeURIComponent(ask)}` : (next ?? "/accueil");

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

  async function celebrateThen(title: string, hint: string, next: () => void) {
    const token = ++celebrateGen.current;
    setCelebrate({ title, hint });
    await wait(reduce ? 180 : 950);
    if (!mounted.current || token !== celebrateGen.current) return;
    setCelebrate(null);
    next();
  }

  async function advance() {
    if (step === 0) {
      const res = await saveWelcome(name, lang, family);
      if (!res.ok) throw new Error(res.error);
      await celebrateThen("Identité enregistrée", "Prochaine étape : un document BTP.", () => setStep(PDF_STEP));
    }
  }

  async function skipDocument() {
    await saveOnboardingStep("document_skipped");
    await celebrateThen("C’est noté", "Vous pourrez importer un PDF plus tard.", () => setStep(FIN_STEP));
  }

  function afterPdfSaved() {
    setImported(true);
    void saveOnboardingStep("document");
    void celebrateThen("Document importé", "Il est prêt dans TARINEO.", () => setStep(FIN_STEP));
  }

  async function enter() {
    const res = await finishOnboarding();
    if (!res.ok) throw new Error(res.error);
    router.replace(dest);
    router.refresh();
  }

  const motionProps = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 12, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -8, scale: 0.99 },
        transition: POP_PAGE,
      };

  return (
    <div className="relative grid h-full min-h-0 flex-1 grid-rows-[auto_auto_minmax(0,1fr)]">
      <SuccessPopOverlay
        open={Boolean(celebrate)}
        title={celebrate?.title ?? ""}
        hint={celebrate?.hint}
      />
      <WizardStepBg step={step} />
      <div className="mb-3 flex items-center gap-3 px-0.5">
        <div className="flex min-w-0 flex-1 gap-1" aria-label={`Étape ${step + 1} sur ${ONBOARD_STEPS.length}`}>
          {ONBOARD_STEPS.map((s, i) => (
            <motion.i
              key={s.id}
              layout
              className={cn("h-1 flex-1 rounded-pill", i <= step ? "bg-brand-orange" : "bg-ink/12")}
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
            <motion.div key={step} className="flex min-h-full flex-col" {...motionProps}>
              {step === 0 ? (
                <IdentiteScreen first={name} last={family} lang={lang} onFirst={setName} onLast={setFamily} onLang={setLang} />
              ) : null}
              {step === PDF_STEP ? (
                <OnboardingPdfStep
                  chantiers={chantiers}
                  clients={clients}
                  pending={pending}
                  onSkip={() => go(skipDocument)}
                  onSaved={afterPdfSaved}
                />
              ) : null}
              {step === FIN_STEP ? (
                <SuccessPop
                  size="lg"
                  className="flex-1 justify-center py-8"
                  title={imported ? "Votre devis est dans TARINEO." : "C’est prêt."}
                  hint={
                    imported
                      ? "Affinez la marge, transformez pour le client. L’entreprise (SIRET) sera demandée à l’envoi de la pièce client."
                      : "Explorez le tableau de bord — vous pourrez importer un PDF depuis Documents fournisseur."
                  }
                  action={
                    <Button
                      type="button"
                      size="lg"
                      className="min-h-12 rounded-full"
                      disabled={pending}
                      onClick={() => go(enter)}
                    >
                      {pending ? <Loader2 className="animate-spin" /> : "Ouvrir le tableau de bord"}
                    </Button>
                  }
                />
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
            {step > 0 ? (
              <Button type="button" variant="ghost" className="min-h-11" disabled={pending} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                <ArrowLeft data-icon="inline-start" aria-hidden />
                Retour
              </Button>
            ) : (
              <span />
            )}
            <Button type="button" className="ml-auto min-h-11 rounded-full" disabled={pending} onClick={() => go(advance)}>
              {pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null}
              Continuer
              {!pending ? <ArrowRight data-icon="inline-end" /> : null}
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}
