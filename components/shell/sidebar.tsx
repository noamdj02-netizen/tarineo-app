"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  ChevronRight,
  CreditCard,
  LifeBuoy,
  LogIn,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { EASE } from "@/components/motion/reveal";
import { BRAND } from "@/lib/brand";
import type { OnboardingStep } from "@/lib/onboarding";
import { NAV_SECTIONS, isNavDrawer, type NavDrawer, type Tab, isActive } from "@/lib/nav";
import type { Viewer } from "@/lib/session";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Logo } from "./logo";
import { useTheme } from "@/components/theme/theme-provider";

const SUPPORT_MAIL = BRAND.contactEmail;

/** Barre latérale — thème synchronisé avec le mode global (clair/sombre). */
export function Sidebar({
  onboarding,
  viewer,
}: {
  onboarding: OnboardingStep[];
  viewer: Viewer | null;
}) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const { resolved } = useTheme();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col border-r border-side-line bg-side px-3 pb-4 text-side-ink transition-[background-color,border-color,color] duration-[180ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none lg:flex"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex h-16 shrink-0 items-center px-1.5">
        <Logo theme={resolved} size={28} showWordmark className="shrink-0" />
      </div>

      <nav
        aria-label="Navigation principale"
        className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1"
      >
        {NAV_SECTIONS.map((section, si) => (
          <div key={section.id} className={cn(si > 0 && "mt-5")}>
            <p className="mb-1.5 px-2.5 text-[10.5px] font-semibold tracking-[0.08em] text-[color:var(--color-side-hint)] uppercase">
              {section.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) =>
                isNavDrawer(item) ? (
                  <SideDrawer key={item.id} drawer={item} pathname={pathname} search={search} />
                ) : (
                  <SideNavItem key={item.href} tab={item} pathname={pathname} search={search} />
                ),
              )}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-3 flex shrink-0 flex-col gap-3 border-t border-side-line pt-3">
        <OnboardingCard steps={onboarding} />

        <div className="flex flex-col gap-1 px-1">
          <SideFooterButton
            href="/entreprise"
            icon={Building2}
            label="Mon entreprise"
            hint="SIRET, TVA, logo, PDF"
            active={isActive(pathname, "/entreprise")}
          />
          <SideFooterButton
            href="/abonnement"
            icon={CreditCard}
            label="Tarifs"
            hint="Formule et essai"
            active={isActive(pathname, "/abonnement")}
          />
          <SideFooterButton
            href={`mailto:${SUPPORT_MAIL}?subject=Support%20Tarin%C3%A9o`}
            icon={LifeBuoy}
            label="Support"
            hint={SUPPORT_MAIL}
            external
          />
          {viewer ? (
            <SignOutButton
              className={cn(
                footerButtonClass("ghost"),
                "justify-start px-2.5",
              )}
            />
          ) : (
            <SideFooterButton
              href="/login"
              icon={LogIn}
              label="Connexion"
              hint="E-mail ou Google"
              variant="primary"
            />
          )}
        </div>
      </div>
    </aside>
  );
}

function SideDrawer({
  drawer,
  pathname,
  search,
}: {
  drawer: NavDrawer;
  pathname: string;
  search: string;
}) {
  const childOn = drawer.items.some((t) => isActive(pathname, t.href, search));
  const [open, setOpen] = useState(childOn);
  const shown = open || childOn;
  const Icon = drawer.icon;

  return (
    <li>
      <button
        type="button"
        aria-expanded={shown}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex min-h-9 w-full items-center gap-2.5 rounded-xl px-2.5 text-left text-[13px] font-medium tracking-[-0.02em] transition-[color,background-color] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          childOn ? "nav-active" : shown ? "nav-idle bg-tarineo-orange-hover" : "nav-idle",
        )}
      >
        <Icon className="size-[17px] shrink-0" aria-hidden />
        <span className="min-w-0 flex-1 truncate">{drawer.label}</span>
        <ChevronRight
          className={cn("size-3.5 shrink-0 transition-transform duration-300", shown && "rotate-90")}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {shown ? (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="mt-0.5 ml-3 overflow-hidden border-l border-side-line pl-2"
          >
            {drawer.items.map((tab) => (
              <SideNavItem key={tab.href} tab={tab} pathname={pathname} search={search} nested />
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function SideNavItem({
  tab,
  pathname,
  search = "",
  nested,
}: {
  tab: Tab;
  pathname: string;
  search?: string;
  nested?: boolean;
}) {
  const on = isActive(pathname, tab.href, search);
  const Icon = tab.icon;
  return (
    <li className="relative">
      <Link
        href={tab.href}
        prefetch={true}
        aria-current={on ? "page" : undefined}
        className={cn(
          "relative flex min-h-9 items-center gap-2.5 rounded-xl px-2.5 text-[13px] font-medium tracking-[-0.02em] transition-[color,background-color] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          nested && "min-h-8 text-[12.5px]",
          on ? "nav-active" : "nav-idle",
        )}
      >
        <Icon className={cn("shrink-0", nested ? "size-3.5" : "size-[17px]")} aria-hidden />
        {tab.label}
      </Link>
    </li>
  );
}

function footerButtonClass(variant: "ghost" | "primary", active?: boolean) {
  return cn(
    "flex w-full min-h-10 items-center gap-2.5 rounded-xl px-2.5 text-left transition-[color,background-color] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
    variant === "primary"
      ? "bg-side-ink text-side hover:opacity-90"
      : active
        ? "nav-active"
        : "nav-idle",
  );
}

function SideFooterButton({
  href,
  icon: Icon,
  label,
  hint,
  active,
  external,
  variant = "ghost",
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  hint?: string;
  active?: boolean;
  external?: boolean;
  variant?: "ghost" | "primary";
}) {
  const cls = footerButtonClass(variant, active);
  const body = (
    <>
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="flex min-w-0 flex-col">
        <span className="text-[13px] font-medium leading-tight tracking-[-0.02em]">{label}</span>
        {hint ? (
          <span className="truncate text-[11px] leading-tight text-[color:var(--color-side-hint)]">{hint}</span>
        ) : null}
      </span>
    </>
  );
  if (external) {
    return (
      <a href={href} className={cls}>
        {body}
      </a>
    );
  }
  return (
    <Link href={href} prefetch={true} className={cls}>
      {body}
    </Link>
  );
}

/** Bloc « Démarrage 3/5 » avec barre de progression. */
export function OnboardingCard({ steps }: { steps: OnboardingStep[] }) {
  const done = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);
  if (!next) return null;

  return (
    <div className="rounded-card border border-side-line bg-[color:var(--color-side-card)] p-3">
      <div className="flex items-baseline justify-between">
        <p className="text-[10.5px] font-semibold tracking-[0.08em] text-[color:var(--color-side-hint)] uppercase">
          Démarrage
        </p>
        <p className="font-mono text-xs text-side-muted tabular-nums">
          {done}/{steps.length}
        </p>
      </div>
      <div
        className="mt-2.5 h-1.5 overflow-hidden rounded-pill bg-side-ink/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={done}
        aria-label="Progression du démarrage"
      >
        <motion.div
          className="h-full rounded-pill bg-tarineo-orange"
          initial={{ width: 0 }}
          animate={{ width: `${(done / steps.length) * 100}%` }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        />
      </div>
      <Link
        href={next.href}
        className="group mt-2.5 flex items-center justify-between gap-2 text-[12.5px] leading-snug text-side-muted transition-colors duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:text-tarineo-orange"
      >
        <span className="line-clamp-2">Ensuite : {next.label}</span>
        <ArrowUpRight
          className="size-3.5 flex-none transition-transform duration-300 ease-out-soft group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </div>
  );
}
