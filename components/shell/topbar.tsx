"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Illustration } from "@/components/illustration";
import { EASE } from "@/components/motion/reveal";
import type { Viewer } from "@/lib/session";
import { cn } from "@/lib/utils";
import { CommandPalette, useCommandPalette } from "./command-palette";
import { Logo } from "./logo";

/** Barre du haut : recherche ⌘K, pastille du plan (vers /abonnement), avatar. */
export function Topbar({ viewer, plan }: { viewer: Viewer | null; plan: string }) {
  const palette = useCommandPalette();

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-md sm:px-6"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="flex min-h-15 w-full items-center gap-3">
        <Logo className="text-[24px] lg:hidden" />

        {/* Desktop / tablette : faux champ qui ouvre la recherche */}
        <button
          type="button"
          onClick={() => palette.setOpen(true)}
          className="hidden h-10 w-full max-w-md items-center gap-2.5 rounded-pill border border-line bg-surface-2 px-4 text-left text-[14px] text-muted transition-[box-shadow,background-color] duration-300 ease-out-soft hover:bg-surface hover:shadow-soft sm:flex"
        >
          <Search className="size-4" aria-hidden />
          <span className="flex-1">Rechercher…</span>
          <kbd className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-[10.5px] text-ink/70">
            ⌘K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => palette.setOpen(true)}
            aria-label="Rechercher"
            className="grid size-11 place-items-center rounded-pill text-ink sm:hidden"
          >
            <Search className="size-5" aria-hidden />
          </button>
          <Link
            href="/abonnement"
            className={cn(
              "hidden rounded-pill border px-3 py-1.5 font-mono text-[10.5px] font-medium tracking-[0.12em] uppercase transition-colors sm:inline-block",
              plan === "Gratuit"
                ? "border-line bg-surface-2 text-ink/70 hover:text-ink"
                : "border-ink bg-ink text-accent-ink",
            )}
          >
            {plan === "Gratuit" ? "Plan gratuit · Passer Pro" : `Plan ${plan}`}
          </Link>
          <AvatarMenu viewer={viewer} />
        </div>
      </div>

      <CommandPalette open={palette.open} onClose={() => palette.setOpen(false)} />
    </header>
  );
}

function AvatarMenu({ viewer }: { viewer: Viewer | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Mon compte"
        className="btn-dark grid size-10 place-items-center rounded-pill font-mono text-[13px] font-medium"
      >
        {viewer?.initial ?? "·"}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            className="card-soft absolute right-0 mt-2 w-64 p-2"
            initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <div className="flex items-center gap-3 px-3 py-2">
              <Illustration name="onboarding-configurer" className="-my-1 size-12" />
              <div className="min-w-0">
                <p className="mono-label">/ Compte</p>
                <p className="mt-1 truncate text-sm">{viewer?.email ?? "Non connecté"}</p>
              </div>
            </div>
            <Link
              role="menuitem"
              href="/abonnement"
              onClick={() => setOpen(false)}
              className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm hover:bg-accent-soft"
            >
              <CreditCard className="size-4 text-muted" aria-hidden />
              Abonnement
            </Link>
            {viewer?.canSignOut ? (
              <form action="/auth/signout" method="post">
                <button
                  role="menuitem"
                  type="submit"
                  className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm hover:bg-accent-soft"
                >
                  <LogOut className="size-4 text-muted" aria-hidden />
                  Se déconnecter
                </button>
              </form>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
