"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { enregistrerEntreprise } from "@/app/(app)/entreprise/actions";
import { createChantierAction } from "@/app/(app)/metier/actions";
import { EntrepriseLookupFlow } from "@/components/metier/entreprise-lookup-flow";
import { IdentiteScreen } from "@/components/onboarding/screens/identite-screen";
import { WelcomeScreen } from "@/components/onboarding/screens/welcome-screen";
import { WizardStepBg } from "@/components/onboarding/wizard-step-bg";
import { TarineoHdMascot } from "@/components/tarineo-hd-mascot";
import { EASE } from "@/components/motion/reveal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/lib/i18n";
import { ONBOARD_STEPS } from "@/lib/onboarding/catalog";
import { cn } from "@/lib/utils";
import { finishOnboarding, saveWelcome } from "./actions";

export function Wizard({
  firstName,
  lastName,
  locale,
  email,
  next,
  ask,
  startStep = 0,
}: {
  firstName: string;
  lastName: string;
  locale: Locale;
  email: string;
  avatarUrl: string | null;
  initial: string;
  projects: { id: string; name: string; slug: string; status: string }[];
  next?: string;
  ask?: string;
  startStep?: number;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(Math.min(startStep, ONBOARD_STEPS.length - 1));
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(firstName);
  const [family, setFamily] = useState(lastName);
  const [lang, setLang] = useState<Locale>(locale);

  const last = ONBOARD_STEPS.length - 1;
  const hideFooter = step === 0 || step === last;
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

  async function advance() {
    if (step === 1) {
      const res = await saveWelcome(name, lang, family);
      if (!res.ok) throw new Error(res.error);
      setStep(2);
      return;
    }
    if (step === 2) {
      const form = document.getElementById("onboard-entreprise") as HTMLFormElement | null;
      if (!form) throw new Error("Formulaire entreprise introuvable.");
      const res = await enregistrerEntreprise(new FormData(form));
      if (!res.ok) throw new Error(res.error);
      setStep(3);
      return;
    }
    if (step === 3) {
      const form = document.getElementById("onboard-chantier") as HTMLFormElement | null;
      if (!form) throw new Error("Formulaire chantier introuvable.");
      const res = await createChantierAction(new FormData(form));
      if (!res.ok) throw new Error(res.error);
      setStep(4);
    }
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
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.4, ease: EASE },
      };

  return (
    <div className="relative grid h-full min-h-0 flex-1 grid-rows-[auto_auto_minmax(0,1fr)]">
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
              {step === 0 ? <WelcomeScreen onStart={() => setStep(1)} /> : null}
              {step === 1 ? (
                <IdentiteScreen first={name} last={family} lang={lang} onFirst={setName} onLast={setFamily} onLang={setLang} />
              ) : null}
              {step === 2 ? (
                <EntrepriseLookupFlow
                  variant="onboarding"
                  emailContact={email}
                  formId="onboard-entreprise"
                  onSkipLater={() => go(async () => setStep(3))}
                />
              ) : null}
              {step === 3 ? <ChantierOnboard /> : null}
              {step === 4 ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <TarineoHdMascot name="01-pouce-leve" className="h-36 w-40" label="" priority />
                  <h2 className="mt-4 font-display text-[28px] font-semibold tracking-tight">C’est prêt.</h2>
                  <p className="mt-2 max-w-[36ch] text-[15px] text-muted-foreground">
                    Déposez un devis Cedeo, transformez-le, envoyez-le au client. Le tableau de bord est le même : orange, noir, vos pièces.
                  </p>
                  <Button type="button" size="lg" className="mt-6 min-h-12 rounded-full" disabled={pending} onClick={() => go(enter)}>
                    {pending ? <Loader2 className="animate-spin" /> : "Ouvrir le tableau de bord"}
                  </Button>
                </div>
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
            <Button type="button" variant="ghost" className="min-h-11" disabled={pending} onClick={() => setStep((s) => Math.max(0, s - 1))}>
              <ArrowLeft data-icon="inline-start" aria-hidden />
              Retour
            </Button>
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

function ChantierOnboard() {
  return (
    <form id="onboard-chantier" className="flex flex-col gap-3">
      <TarineoHdMascot name="11-equipe" className="h-24 w-28 self-center" label="" />
      <h2 className="font-display text-[24px] font-semibold tracking-tight">Le chantier en cours</h2>
      <p className="text-[14px] text-muted-foreground">Les devis Cedeo et les pièces client se rangeront ici.</p>
      <label className="text-[13px]">
        Nom du chantier
        <Input name="name" required placeholder="Maison Dupont — Lyon 3" className="mt-1 h-11 rounded-xl" />
      </label>
      <label className="text-[13px]">
        Adresse
        <Input name="address" placeholder="12 rue des Acacias" className="mt-1 h-11 rounded-xl" />
      </label>
      <label className="text-[13px]">
        Client
        <Input name="client" placeholder="Madame Dupont" className="mt-1 h-11 rounded-xl" />
      </label>
    </form>
  );
}
