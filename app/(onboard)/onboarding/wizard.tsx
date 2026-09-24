"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AvatarForm } from "@/app/(app)/compte/forms";
import { Field as AuthField } from "@/components/auth/auth-ui";
import { WizardStepBg } from "@/components/onboarding/wizard-step-bg";
import { Illustration } from "@/components/illustration";
import { EASE } from "@/components/motion/reveal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { THEMES, THEME_TOKENS } from "@/lib/design-data/themes";
import { LOCALE_LABEL, type Locale } from "@/lib/i18n";
import type { IllustrationName } from "@/lib/illustrations";
import { WIZARD_STEPS } from "@/lib/onboarding-wizard";
import { cn } from "@/lib/utils";
import {
  analyzeProjects,
  finishOnboarding,
  saveProjects,
  saveTaste,
  saveWelcome,
  type Analysis,
} from "./actions";

const STEPS = [
  { label: "Toi", art: "onboarding-bienvenue" as IllustrationName },
  { label: "Projets", art: "onboarding-premier-pas" as IllustrationName },
  { label: "Analyse", art: "dashboard-analyse" as IllustrationName },
  { label: "Goût", art: "onboarding-configurer" as IllustrationName },
  { label: "Prêt", art: "landing-commencer" as IllustrationName },
] as const;

const TOOLS = [
  "Figma",
  "Notion",
  "Cursor",
  "Claude",
  "ChatGPT",
  "GitHub",
  "Vercel",
  "Supabase",
  "Stripe",
  "Gmail",
  "Canva",
  "LinkedIn",
] as const;

const projectInputClass =
  "h-12 rounded-xl bg-surface/80 text-[15px] lg:bg-surface-2";

export function Wizard({
  firstName,
  locale,
  next,
  ask,
}: {
  firstName: string;
  locale: Locale;
  next?: string;
  ask?: string;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(firstName);
  const [lang, setLang] = useState<Locale>(locale);
  const [projects, setProjects] = useState(["", "", ""]);
  const [ids, setIds] = useState<string[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});
  const [theme, setTheme] = useState(THEMES[0].id);
  const [tools, setTools] = useState<string[]>(["Figma", "Cursor", "Claude"]);

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

  const stepMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 16, filter: "blur(6px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: -10, filter: "blur(4px)" },
        transition: { duration: 0.45, ease: EASE },
      };

  return (
    <div className="relative flex min-h-[calc(100dvh-5rem)] flex-1 flex-col lg:min-h-0">
      <WizardStepBg step={step} />

      <div
        className="mb-5 flex gap-1.5 px-0.5 lg:mb-4"
        aria-label={`Étape ${step + 1} sur ${STEPS.length}`}
      >
        {STEPS.map((s, i) => (
          <motion.i
            key={s.label}
            layout
            className={cn(
              "h-1 flex-1 rounded-pill lg:h-1.5",
              i <= step ? "bg-ink" : "bg-ink/12",
            )}
            transition={{ duration: 0.35, ease: EASE }}
          />
        ))}
      </div>

      <ol className="mb-4 hidden flex-col gap-1 lg:flex">
        {WIZARD_STEPS.map((label, i) => (
          <li
            key={label}
            className={cn(
              "text-[12.5px] leading-snug",
              i === step ? "font-medium text-ink" : i < step ? "text-muted-foreground line-through" : "text-muted-foreground",
            )}
          >
            {label}
          </li>
        ))}
      </ol>

      <Card className="flex flex-1 flex-col border-line bg-surface/90 shadow-soft ring-1 ring-line lg:rounded-card">
        <CardContent className="flex flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="flex flex-1 flex-col"
            initial={stepMotion.initial}
            animate={stepMotion.animate}
            exit={stepMotion.exit}
            transition={stepMotion.transition}
          >
            {/* Mobile : bonhomme centré + titre éditorial */}
            <div className="flex flex-col items-center text-center lg:hidden">
              <motion.div
                initial={reduce ? false : { scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
                className="mb-2"
              >
                <Illustration
                  name={STEPS[step].art}
                  depth={12}
                  className="size-[min(52vw,220px)] drop-shadow-[0_20px_40px_rgba(17,17,17,0.08)]"
                  label={titles[step]}
                />
              </motion.div>
              <h1 className="font-serif text-[clamp(2rem,7.5vw,2.35rem)] leading-[1.06] tracking-[-0.02em] text-balance">
                {mobileTitles[step]}
              </h1>
              <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-muted-foreground">
                {leads[step]}
              </p>
            </div>

            {/* Desktop : en-tête compact */}
            <div className="mb-5 hidden items-start justify-between gap-4 lg:flex">
              <div>
                <p className="mono-label">{`/ ${STEPS[step].label} ///`}</p>
                <h1 className="mt-2 font-display text-[clamp(26px,6vw,34px)] leading-[1.05] font-semibold tracking-tightest">
                  {titles[step]}
                </h1>
                <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground">{leads[step]}</p>
              </div>
              <Illustration name={STEPS[step].art} className="-mt-2 size-20" depth={8} />
            </div>

            <div className="mt-6 flex flex-col gap-4 lg:mt-0">
              {step === 0 ? (
                <FieldGroup className="gap-4 lg:mt-2">
                  <AuthField
                    label="Prénom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={60}
                    autoComplete="given-name"
                  />
                  <div className="flex justify-center gap-2 lg:justify-start">
                    {(["fr", "en"] as const).map((l) => (
                      <Button
                        key={l}
                        type="button"
                        variant={lang === l ? "default" : "outline"}
                        onClick={() => setLang(l)}
                        className="min-h-11 rounded-full px-5"
                      >
                        {LOCALE_LABEL[l]}
                      </Button>
                    ))}
                  </div>
                </FieldGroup>
              ) : null}

              {step === 1 ? (
                <FieldGroup className="gap-3">
                  {projects.map((p, i) => (
                    <Input
                      key={i}
                      value={p}
                      onChange={(e) =>
                        setProjects((cur) => cur.map((x, n) => (n === i ? e.target.value : x)))
                      }
                      placeholder={i === 0 ? "Ex. Studio Devis" : "Optionnel"}
                      maxLength={80}
                      className={projectInputClass}
                      aria-label={i === 0 ? "Nom du premier projet" : `Projet ${i + 1} optionnel`}
                    />
                  ))}
                </FieldGroup>
              ) : null}

              {step === 2 ? (
                <div className="flex max-h-[min(42vh,320px)] flex-col gap-3 overflow-y-auto lg:max-h-none">
                  {ids.map((id, i) => {
                    const a = analyses[id];
                    return (
                      <Card
                        key={id}
                        size="sm"
                        className="border-line bg-surface/75 backdrop-blur-sm lg:bg-surface-2"
                      >
                        <CardHeader className="px-4 py-3">
                          <CardTitle className="text-[15px] font-semibold tracking-[-0.02em]">
                            {names[i]}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pt-0 pb-4">
                        {a ? (
                          <ul className="mt-2 flex flex-col gap-1.5 text-[14px] text-ink/80">
                            <li>{a.pitch}</li>
                            <li>
                              <b>Prochaine action :</b> {a.next}
                            </li>
                          </ul>
                        ) : (
                          <p className="mt-2 flex items-center gap-2 text-[14px] text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                            Analyse en cours…
                          </p>
                        )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : null}

              {step === 3 ? (
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {THEMES.map((t) => {
                      const tok = THEME_TOKENS[t.id];
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTheme(t.id)}
                          className={cn(
                            "rounded-[16px] border p-3 text-left transition-transform duration-200 active:scale-[0.98]",
                            theme === t.id ? "border-ink bg-surface/90" : "border-line bg-surface/60",
                          )}
                        >
                          <span className="flex gap-1">
                            {["--k-accent", "--k-text", "--k-bg"].map((k) => (
                              <i
                                key={k}
                                className="size-4 rounded-full"
                                style={{ background: tok?.[k] ?? "#111" }}
                              />
                            ))}
                          </span>
                          <span className="mt-2 block text-[14px] font-semibold">{t.n}</span>
                          <span className="block text-[12px] text-muted-foreground">{t.f.split("·")[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div>
                    <p className="text-center text-[14px] text-muted-foreground lg:text-left">Avec quoi tu travailles ?</p>
                    <div className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
                      {TOOLS.map((t) => {
                        const on = tools.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() =>
                              setTools((cur) => (on ? cur.filter((x) => x !== t) : [...cur, t]))
                            }
                            className={cn(
                              "min-h-10 rounded-pill px-3.5 text-[13.5px] font-medium transition-transform duration-200 active:scale-[0.98]",
                              on ? "bg-ink text-accent-ink" : "border border-line bg-surface/70",
                            )}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center lg:justify-start">
                    <AvatarForm avatarUrl={null} initial={(name || "?").charAt(0).toUpperCase()} />
                  </div>
                  <ul className="flex flex-col gap-2 text-[14.5px] leading-relaxed text-ink/80">
                    <li>Un seul projet en Focus jusqu’à la première vente.</li>
                    <li>⌘J ouvre le copilote. Dépose un fichier dans la barre d’accueil.</li>
                    <li>Les prix Pro : 15 €, puis 12 €, puis 9 € / mois.</li>
                  </ul>
                </div>
              ) : null}
            </div>
          </motion.div>
        </AnimatePresence>

        {error ? (
          <Alert variant="destructive" className="mt-4 border-destructive/20 bg-st-fini-soft">
            <AlertDescription className="text-center text-[13.5px] text-st-fini-ink lg:text-left">
              {error}
            </AlertDescription>
          </Alert>
        ) : null}

        <div
          className="sticky bottom-0 -mx-4 mt-6 border-t border-line/60 bg-gradient-to-t from-bg via-bg/95 to-transparent px-4 pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:static lg:mx-0 lg:mt-auto lg:border-0 lg:bg-transparent lg:px-0 lg:pt-8"
        >
          <div className="flex items-center gap-3">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="min-h-12 min-w-12 shrink-0 rounded-[14px] lg:min-w-0 lg:gap-2 lg:px-3"
                aria-label="Retour"
              >
                <ArrowLeft aria-hidden />
                <span className="hidden lg:inline">Retour</span>
              </Button>
            ) : null}
            <Button
              type="button"
              disabled={pending}
              className={cn(
                "min-h-[52px] flex-1 rounded-[14px] text-[15px] lg:ml-auto lg:flex-none lg:rounded-full lg:px-6",
              )}
              onClick={() =>
                go(async () => {
                  if (step === 0) {
                    const res = await saveWelcome({ firstName: name, locale: lang });
                    if (!res.ok) throw new Error(res.error);
                    setStep(1);
                    return;
                  }
                  if (step === 1) {
                    if (!ids.length) {
                      const res = await saveProjects(projects);
                      if (!res.ok) throw new Error(res.error);
                      const created = res.ids ?? [];
                      setIds(created);
                      setNames(projects.map((p) => p.trim()).filter(Boolean).slice(0, 3));
                      setStep(2);
                      const ana = await analyzeProjects(created);
                      if (ana.ok) setAnalyses(ana.analyses);
                    } else setStep(2);
                    return;
                  }
                  if (step === 2) {
                    setStep(3);
                    return;
                  }
                  if (step === 3) {
                    const res = await saveTaste(theme, tools);
                    if (!res.ok) throw new Error(res.error);
                    setStep(4);
                    return;
                  }
                  const res = await finishOnboarding();
                  if (!res.ok) throw new Error(res.error);
                  const dest = ask
                    ? `/accueil?ask=${encodeURIComponent(ask)}`
                    : next ?? "/accueil";
                  router.replace(dest);
                  router.refresh();
                })
              }
            >
              {pending ? <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden /> : null}
              {step === 4 ? "Entrer dans le cockpit" : "Continuer"}
              {step < 4 && !pending ? <ArrowRight data-icon="inline-end" aria-hidden /> : null}
            </Button>
          </div>
          <p className="mt-3 hidden text-center text-[12px] text-muted-foreground lg:block">
            Étape {step + 1} / {STEPS.length}
          </p>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}

const titles = [
  "On fait connaissance.",
  "Tes projets, maintenant.",
  "L’IA a regardé.",
  "Ton goût, tes outils.",
  "C’est prêt.",
];

const mobileTitles = [
  "Ton prénom",
  "Tes projets",
  "L’IA analyse",
  "Ton goût",
  "C’est prêt",
];

const leads = [
  "Une minute pour ton prénom et ta langue — ensuite on place tes projets.",
  "Qu’est-ce que tu construis en ce moment ? Le premier passe en Focus.",
  "Le copilote propose une prochaine action pour chaque projet.",
  "Choisis un thème et les outils que tu utilises au quotidien.",
  "Photo optionnelle, quelques conseils, puis tu entres dans le cockpit.",
];
