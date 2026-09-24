"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EASE } from "@/components/motion/reveal";
import type { OnboardingStep } from "@/lib/onboarding";
import { TABS, isActive } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

/** Barre latérale noire (desktop). */
export function Sidebar({ onboarding }: { onboarding: OnboardingStep[] }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-[252px] flex-none flex-col bg-side px-4 pt-6 pb-4 text-side-ink lg:flex">
      <Logo className="px-3" />

      <p className="mono-label mt-8 mb-2 px-3 text-side-muted">{"/ Navigation ///"}</p>
      <nav aria-label="Navigation principale" className="-mx-1 flex-1 overflow-y-auto px-1">
        <ul className="flex flex-col gap-0.5">
          {TABS.map(({ href, label, icon: Icon }) => {
            const on = isActive(pathname, href);
            return (
              <li key={href} className="relative">
                {on ? (
                  <motion.span
                    layoutId="side-active"
                    transition={{ duration: 0.35, ease: EASE }}
                    className="absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-r from-white/[.16] via-white/[.07] to-white/0"
                    aria-hidden
                  />
                ) : null}
                <Link
                  href={href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "relative flex min-h-10 items-center gap-3 rounded-xl px-3 font-mono text-[11.5px] font-medium tracking-[0.1em] uppercase transition-colors duration-300 ease-out-soft",
                    on ? "text-side-ink" : "text-side-muted hover:text-side-ink",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <OnboardingCard steps={onboarding} />
    </aside>
  );
}

/** Bloc « Démarrage 3/5 » avec barre de progression. */
export function OnboardingCard({ steps }: { steps: OnboardingStep[] }) {
  const done = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);
  if (!next) return null;

  return (
    <div className="mt-4 rounded-card border border-side-line bg-white/[.04] p-4">
      <div className="flex items-baseline justify-between">
        <p className="mono-label text-side-muted">/ Démarrage</p>
        <p className="font-mono text-xs text-side-ink tabular-nums">
          {done}/{steps.length}
        </p>
      </div>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-pill bg-white/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={done}
        aria-label="Progression du démarrage"
      >
        <motion.div
          className="h-full rounded-pill bg-gradient-to-r from-white/60 to-white"
          initial={{ width: 0 }}
          animate={{ width: `${(done / steps.length) * 100}%` }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        />
      </div>
      <Link
        href={next.href}
        className="group mt-3 flex items-center justify-between gap-2 text-[13px] text-side-ink/80 hover:text-side-ink"
      >
        <span>Ensuite : {next.label}</span>
        <ArrowUpRight
          className="size-3.5 flex-none transition-transform duration-300 ease-out-soft group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </div>
  );
}
