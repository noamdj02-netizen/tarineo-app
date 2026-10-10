"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef } from "react";

import { Button } from "@/components/site/landing-v2/components/ui/Button";
import { LANDING_LOGIN, LANDING_PRIMARY_CTA_LABEL, LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { landingNavGroups, type LandingNavGroup } from "@/lib/site/landing-v2-content";
import { landingNavHref } from "@/lib/site/landing-nav";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
};

function NavLink({
  href,
  label,
  onNavigate,
  pathname,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
  pathname: string;
}) {
  const resolved = landingNavHref(href, pathname);
  const isExternal = resolved.startsWith("http") || resolved.startsWith("mailto:");
  const className =
    "block rounded-lg px-3 py-2.5 text-[0.9375rem] text-ink-600 outline-none transition-colors hover:bg-paper-50 hover:text-ink-900 focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-inset";

  return (
    <a
      href={resolved}
      className={className}
      onClick={onNavigate}
      rel={isExternal ? "noopener noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
    >
      {label}
    </a>
  );
}

function NavSection({
  group,
  onNavigate,
  pathname,
}: {
  group: LandingNavGroup;
  onNavigate: () => void;
  pathname: string;
}) {
  return (
    <div>
      <h3 className="eyebrow px-3 text-ink-400">{group.title}</h3>
      <ul className="mt-2 flex flex-col gap-0.5">
        {group.items.map((item) => (
          <li key={`${group.title}-${item.href}-${item.label}`}>
            <NavLink
              href={item.href}
              label={item.label}
              onNavigate={onNavigate}
              pathname={pathname}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LandingNavDrawer({ open, onClose }: Props) {
  const pathname = usePathname();
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Fermer le menu"
        className="absolute inset-0 bg-ink-900/25 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-full w-full max-w-[min(100%,22rem)] flex-col border-l border-line bg-paper-0 shadow-float overscroll-contain motion-safe:animate-in motion-safe:slide-in-from-right motion-safe:duration-200"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3.5 sm:px-5">
          <p id={titleId} className="text-sm font-semibold text-ink-900">Menu</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper-0 text-ink-900 outline-none transition-[background-color,transform] duration-150 ease-out hover:bg-paper-50 focus-visible:ring-2 focus-visible:ring-accent/45 active:scale-[0.96] [-webkit-tap-highlight-color:transparent]"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav
          aria-label="Navigation du site"
          className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4"
        >
          <div className="flex flex-col gap-6">
            {landingNavGroups.map((group) => (
              <NavSection
                key={group.title}
                group={group}
                onNavigate={onClose}
                pathname={pathname}
              />
            ))}
          </div>
        </nav>

        <div className="border-t border-line px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-2">
            <Button href={LANDING_SIGNUP} className="w-full justify-center" onClick={onClose}>
              {LANDING_PRIMARY_CTA_LABEL}
            </Button>
            <Button href={LANDING_LOGIN} variant="secondary" className="w-full justify-center" onClick={onClose}>
              Connexion
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
