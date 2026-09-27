"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  ChevronRight,
  LifeBuoy,
  Link2,
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

const SUPPORT_MAIL = BRAND.contactEmail;

/** Barre latérale noire (desktop). */
export function Sidebar({
  onboarding,
  viewer,
}: {
  onboarding: OnboardingStep[];
  viewer: Viewer | null;
}) {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 hidden w-[252px] flex-col bg-side px-3 pt-5 pb-4 text-side-ink lg:flex"
      style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
    >
      <Logo className="shrink-0 px-2" />

      <nav
        aria-label="Navigation principale"
        className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1"
      >
        {NAV_SECTIONS.map((section, si) => (
          <div key={section.id} className={cn(si > 0 && "mt-5")}>
            <p className="mono-label mb-1.5 px-2 text-side-muted/90">{`/ ${section.label} ///`}</p>
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
            href="/outils"
            icon={Link2}
            label="Fournisseurs"
            hint="Enseignes, export comptable"
            active={isActive(pathname, "/outils")}
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
                "justify-start px-2.5 text-side-muted hover:bg-white/[.06] hover:text-side-ink",
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
          "relative flex min-h-9 w-full items-center gap-2.5 rounded-xl px-2.5 text-left text-[13px] font-medium tracking-[-0.02em] transition-colors duration-300 ease-out-soft",
          childOn ? "text-side-ink" : "text-side-muted hover:text-side-ink",
        )}
      >
        <Icon className="size-[17px] shrink-0 opacity-90" aria-hidden />
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
      {on ? (
        <motion.span
          layoutId="side-active"
          transition={{ duration: 0.35, ease: EASE }}
          className="absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-r from-white/[.16] via-white/[.07] to-white/0"
          aria-hidden
        />
      ) : null}
      <Link
        href={tab.href}
        prefetch={true}
        aria-current={on ? "page" : undefined}
        className={cn(
          "relative flex min-h-9 items-center gap-2.5 rounded-xl px-2.5 text-[13px] font-medium tracking-[-0.02em] transition-colors duration-300 ease-out-soft",
          on ? "text-side-ink" : "text-side-muted hover:text-side-ink",
          nested && "min-h-8 text-[12.5px]",
        )}
      >
        <Icon className={cn("shrink-0 opacity-90", nested ? "size-3.5" : "size-[17px]")} aria-hidden />
        {tab.label}
      </Link>
    </li>
  );
}

function footerButtonClass(variant: "ghost" | "primary", active?: boolean) {
  return cn(
    "flex w-full min-h-10 items-center gap-2.5 rounded-xl px-2.5 text-left transition-colors duration-300 ease-out-soft",
    variant === "primary"
      ? "bg-white text-ink hover:bg-white/90"
      : active
        ? "bg-white/10 text-side-ink"
        : "text-side-muted hover:bg-white/[.06] hover:text-side-ink",
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
          <span className="truncate text-[11px] leading-tight text-side-muted">{hint}</span>
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
    <div className="rounded-card border border-side-line bg-white/[.04] p-3">
      <div className="flex items-baseline justify-between">
        <p className="mono-label text-side-muted">/ Démarrage</p>
        <p className="font-mono text-xs text-side-ink tabular-nums">
          {done}/{steps.length}
        </p>
      </div>
      <div
        className="mt-2.5 h-1.5 overflow-hidden rounded-pill bg-white/10"
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
        className="group mt-2.5 flex items-center justify-between gap-2 text-[12.5px] leading-snug text-side-ink/80 hover:text-side-ink"
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
