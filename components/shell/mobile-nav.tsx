"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  FolderKanban,
  House,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TarineoCopilotAvatar } from "@/components/assistant/copilot-face";
import { openAssistant } from "@/lib/assistant/open";
import { R } from "@/lib/routes";
import { cn } from "@/lib/utils";

const EASE = [0.2, 0.8, 0.2, 1] as const;
const LONG_MS = 550;
const MOVE_CANCEL_PX = 14;

/** Destinations autour de l’IA — labels mobile, routes existantes. */
const SIDES = [
  { href: R.accueil, label: "Accueil", icon: House, match: (p: string) => p === "/accueil" || p.startsWith("/accueil/") },
  {
    href: R.chantiers,
    label: "Projets",
    icon: FolderKanban,
    match: (p: string) => p === "/chantiers" || p.startsWith("/chantiers/"),
  },
] as const;

const RIGHT = [
  {
    href: R.clientDevis,
    label: "Bibliothèque",
    icon: BookOpen,
    match: (p: string) =>
      p.startsWith("/client") || p.startsWith("/distributeur") || p.startsWith("/pieces/"),
  },
  {
    href: R.achats,
    label: "Outils",
    icon: Wrench,
    match: (p: string) =>
      p.startsWith("/achats") ||
      p.startsWith("/fournisseurs") ||
      p.startsWith("/comparateur") ||
      p.startsWith("/hausses") ||
      p.startsWith("/relances") ||
      p.startsWith("/entreprise") ||
      p.startsWith("/abonnement") ||
      p.startsWith("/compte"),
  },
] as const;

/** Actions IA = presets / liens déjà présents dans le produit. */
const IA_ACTIONS: { id: string; label: string; kind: "ask" | "href"; value: string }[] = [
  { id: "copilote", label: "Ouvrir le Copilote", kind: "ask", value: "" },
  { id: "relancer", label: "Voir mes devis à relancer", kind: "ask", value: "Voir mes devis à relancer" },
  { id: "chantiers", label: "Faire le point sur mes chantiers", kind: "ask", value: "Faire le point sur mes chantiers" },
  { id: "achats", label: "Analyser mes achats", kind: "ask", value: "Analyser mes achats" },
  { id: "hausses", label: "Voir les hausses fournisseurs", kind: "ask", value: "Voir les hausses fournisseurs" },
  { id: "relances-page", label: "Mes relances", kind: "href", value: R.relances },
  { id: "nouveau-devis", label: "Nouveau devis", kind: "href", value: R.clientDevis },
];

function NavSideItem({
  href,
  label,
  icon: Icon,
  on,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  on: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={on ? "page" : undefined}
      aria-label={label}
      className={cn(
        "relative flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 text-[10.5px] font-medium leading-none transition-colors duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-[0.98] motion-reduce:transition-none",
        on ? "text-white" : "text-white/60 hover:text-white/90",
      )}
    >
      <Icon className="size-[21px]" strokeWidth={on ? 2.05 : 1.65} aria-hidden />
      <span className="truncate">{label}</span>
      {on ? (
        <span
          className="absolute bottom-1.5 size-1 rounded-full bg-[#FF6B1A]"
          aria-hidden
        />
      ) : null}
    </Link>
  );
}

function MobileAssistantButton({
  menuOpen,
  onShortTap,
  onLongPress,
  active,
}: {
  menuOpen: boolean;
  onShortTap: () => void;
  onLongPress: () => void;
  active: boolean;
}) {
  const reduce = useReducedMotion();
  const longFired = useRef(false);
  const cancelled = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const raf = useRef<number | null>(null);
  const startedAt = useRef(0);

  function clearTimers() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    setProgress(0);
    start.current = null;
  }

  function tick() {
    const elapsed = Date.now() - startedAt.current;
    const p = Math.min(1, elapsed / LONG_MS);
    setProgress(p);
    if (p < 1) raf.current = requestAnimationFrame(tick);
  }

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return;
    longFired.current = false;
    cancelled.current = false;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    startedAt.current = Date.now();
    e.currentTarget.setPointerCapture(e.pointerId);
    if (!reduce) raf.current = requestAnimationFrame(tick);
    timer.current = setTimeout(() => {
      if (cancelled.current) return;
      longFired.current = true;
      setProgress(1);
      onLongPress();
      clearTimers();
    }, LONG_MS);
  }

  function onPointerMove(e: React.PointerEvent) {
    const s = start.current;
    if (!s || e.pointerId !== s.id) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (dx * dx + dy * dy > MOVE_CANCEL_PX * MOVE_CANCEL_PX) {
      cancelled.current = true;
      clearTimers();
    }
  }

  function onPointerEnd(e: React.PointerEvent) {
    const s = start.current;
    if (s && e.pointerId !== s.id) return;
    const wasLong = longFired.current;
    const wasCancelled = cancelled.current;
    clearTimers();
    // Long press déjà déclenché → ignorer le click ; déplacement → aucun action.
    if (!wasLong && !wasCancelled) onShortTap();
  }

  function onPointerCancel() {
    cancelled.current = true;
    clearTimers();
  }

  return (
    <Button
      type="button"
      variant="orange-soft"
      size="icon-fab"
      aria-label={menuOpen ? "Fermer le menu IA" : "Menu IA — appui long pour le Copilote"}
      aria-expanded={menuOpen}
      aria-haspopup="menu"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerCancel}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "absolute top-[-30px] left-1/2 z-10 -translate-x-1/2",
        "touch-manipulation select-none",
        "focus-visible:border-tarineo-orange/40 focus-visible:ring-tarineo-orange/30",
        (menuOpen || active) && "ring-2 ring-tarineo-orange/35",
      )}
      style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }}
    >
      <svg
        className="pointer-events-none absolute inset-0 size-full -rotate-90"
        viewBox="0 0 64 64"
        aria-hidden
      >
        <circle
          cx="32"
          cy="32"
          r="30"
          fill="none"
          stroke="currentColor"
          className="text-white/90"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 30}
          strokeDashoffset={2 * Math.PI * 30 * (1 - (reduce ? 0 : progress))}
          style={{
            opacity: progress > 0.02 ? 1 : 0,
            transition: "stroke-dashoffset 75ms linear",
          }}
        />
      </svg>
      <TarineoCopilotAvatar variant="nav" />
    </Button>
  );
}

/**
 * Navbar mobile flottante : Accueil · Projets · [IA] · Bibliothèque · Outils.
 * Tap IA → menu actions ; appui long ~550ms → Copilote existant.
 */
export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [menu, setMenu] = useState(false);

  useEffect(() => setMenu(false), [pathname]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  function runAction(a: (typeof IA_ACTIONS)[number]) {
    setMenu(false);
    if (a.kind === "href") {
      router.push(a.value);
      return;
    }
    if (a.id === "copilote" || !a.value) openAssistant();
    else openAssistant(a.value);
  }

  const copiloteOpenHint = pathname.startsWith("/copilote");

  return (
    <>
      <AnimatePresence>
        {menu ? (
          <motion.button
            key="scrim"
            type="button"
            aria-label="Fermer le menu IA"
            onClick={() => setMenu(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[45] bg-ink/25 lg:hidden"
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {menu ? (
          <motion.div
            key="ia-menu"
            role="menu"
            aria-label="Actions Copilote"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: reduce ? 0.12 : 0.2, ease: EASE }}
            className="pointer-events-auto fixed inset-x-3 z-[50] mx-auto max-w-[420px] overflow-hidden rounded-[18px] border border-line bg-surface shadow-[0_12px_32px_rgba(0,0,0,0.14)] dark:border-white/8 dark:bg-[#111111] lg:hidden"
            style={{
              bottom: "calc(92px + env(safe-area-inset-bottom, 0px))",
            }}
          >
            <div className="border-b border-line px-4 py-3 dark:border-white/8">
              <p className="text-[13px] font-semibold text-ink">Copilote IA</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Actions métier · appui long pour ouvrir le chat
              </p>
            </div>
            <ul className="py-1.5">
              {IA_ACTIONS.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => runAction(a)}
                    className="flex min-h-11 w-full items-center px-4 text-left text-[14px] text-ink transition-colors duration-150 hover:bg-[rgba(255,107,26,0.08)] hover:text-[#FF6B1A]"
                  >
                    {a.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <nav
        aria-label="Navigation principale"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden"
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="pointer-events-auto relative mx-3">
          <div
            className={cn(
              "relative flex h-16 items-stretch rounded-[22px] border border-white/8 px-1",
              "bg-[#1C1C1C]/96 shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-[20px]",
            )}
          >
            {SIDES.map((t) => (
              <NavSideItem key={t.href} {...t} on={t.match(pathname)} />
            ))}

            {/* Réserve centrale pour le bouton IA qui dépasse */}
            <div className="relative w-[72px] shrink-0" aria-hidden />

            {RIGHT.map((t) => (
              <NavSideItem key={t.href} {...t} on={t.match(pathname)} />
            ))}

            <MobileAssistantButton
              menuOpen={menu}
              active={copiloteOpenHint || menu}
              onShortTap={() => setMenu((v) => !v)}
              onLongPress={() => {
                setMenu(false);
                openAssistant();
              }}
            />
          </div>
        </div>
      </nav>
    </>
  );
}
