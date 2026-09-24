"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AvatarForm } from "@/app/(app)/compte/forms";
import { Illustration } from "@/components/illustration";
import { THEMES, THEME_TOKENS } from "@/lib/design-data/themes";
import { LOCALE_LABEL, type Locale } from "@/lib/i18n";
import type { IllustrationName } from "@/lib/illustrations";
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
];

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

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6 flex items-center gap-2" aria-label="Étapes">
        {STEPS.map((s, i) => (
          <i
            key={s.label}
            className={cn(
              "h-1.5 flex-1 rounded-pill transition-colors duration-300",
              i <= step ? "bg-ink" : "bg-line",
            )}
          />
        ))}
      </div>

      <div className="card-soft flex flex-1 flex-col p-5 sm:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="mono-label">{`/ ${STEPS[step].label} ///`}</p>
            <h1 className="mt-2 font-display text-[clamp(26px,6vw,34px)] leading-[1.05] font-semibold tracking-tightest">
              {titles[step]}
            </h1>
          </div>
          <Illustration name={STEPS[step].art} className="-mt-2 size-16 sm:size-20" />
        </div>

        {step === 0 ? (
          <div className="flex flex-col gap-4">
            <p className="text-[15px] leading-relaxed text-muted">
              Une minute. On règle ton prénom, ta langue, puis tes projets.
            </p>
            <label className="flex flex-col gap-1.5 text-[13.5px] font-medium">
              Prénom
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                className="min-h-12 rounded-[14px] border border-line bg-surface-2 px-4 text-[15px] outline-none focus:border-ink/25 focus:bg-surface"
              />
            </label>
            <div className="flex gap-2">
              {(["fr", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={cn(
                    "min-h-11 rounded-pill px-4 text-[14px] font-medium",
                    lang === l ? "bg-ink text-accent-ink" : "border border-line",
                  )}
                >
                  {LOCALE_LABEL[l]}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-muted">
              Quels projets tu as en ce moment ? Le premier passe en Focus.
            </p>
            {projects.map((p, i) => (
              <input
                key={i}
                value={p}
                onChange={(e) =>
                  setProjects((cur) => cur.map((x, n) => (n === i ? e.target.value : x)))
                }
                placeholder={i === 0 ? "Ex. Studio Devis" : "Optionnel"}
                maxLength={80}
                className="min-h-12 rounded-[14px] border border-line bg-surface-2 px-4 text-[15px] outline-none focus:border-ink/25 focus:bg-surface"
              />
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-muted">
              Le copilote a lu tes projets. Tu peux ajuster plus tard dans la fiche.
            </p>
            {ids.map((id, i) => {
              const a = analyses[id];
              return (
                <div key={id} className="rounded-[16px] border border-line bg-surface-2 p-4">
                  <p className="font-semibold tracking-[-0.02em]">{names[i]}</p>
                  {a ? (
                    <ul className="mt-2 flex flex-col gap-1.5 text-[14px] text-ink/80">
                      <li>{a.pitch}</li>
                      <li>
                        <b>Prochaine action :</b> {a.next}
                      </li>
                    </ul>
                  ) : (
                    <p className="mt-2 text-[14px] text-muted">Analyse…</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-[15px] leading-relaxed text-muted">
                Quel design te parle ? On l’accroche à ton projet en Focus.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {THEMES.map((t) => {
                  const tok = THEME_TOKENS[t.id];
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        "rounded-[16px] border p-3 text-left",
                        theme === t.id ? "border-ink" : "border-line",
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
                      <span className="block text-[12px] text-muted">{t.f.split("·")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[15px] text-muted">Avec quoi tu travailles ?</p>
              <div className="mt-3 flex flex-wrap gap-2">
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
                        "min-h-10 rounded-pill px-3.5 text-[13.5px] font-medium",
                        on ? "bg-ink text-accent-ink" : "border border-line bg-surface",
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
            <p className="text-[15px] leading-relaxed text-muted">
              Photo optionnelle. Tu pourras tout changer dans Compte.
            </p>
            <AvatarForm avatarUrl={null} initial={(name || "?").charAt(0).toUpperCase()} />
            <ul className="flex flex-col gap-2 text-[14.5px] leading-relaxed text-ink/80">
              <li>Un seul projet en Focus jusqu’à la première vente.</li>
              <li>⌘J ouvre le copilote. Dépose un fichier dans la barre d’accueil.</li>
              <li>Les prix Pro : 15 €, puis 12 €, puis 9 € / mois.</li>
            </ul>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-[13.5px] text-st-fini-ink">{error}</p> : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-8">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex min-h-11 items-center gap-2 text-[14px] text-muted hover:text-ink"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Retour
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            disabled={pending}
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
            className="btn-dark inline-flex min-h-12 items-center gap-2 rounded-pill px-5 text-[15px] font-medium disabled:opacity-60"
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {step === 4 ? "Entrer dans le cockpit" : "Continuer"}
            {step < 4 && !pending ? <ArrowRight className="size-4" aria-hidden /> : null}
          </button>
        </div>
      </div>
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
