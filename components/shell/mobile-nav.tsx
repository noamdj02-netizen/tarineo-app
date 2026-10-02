"use client";

import { useReducedMotion } from "framer-motion";
import {
  BookOpen,
  FolderKanban,
  House,
  Plus,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { R } from "@/lib/routes";
import { cn } from "@/lib/utils";

const LONG_MS = 550;
const MOVE_CANCEL_PX = 14;

const SIDES = [
  { href: R.accueil, label: "Accueil", icon: House, match: (p: string) => p === "/accueil" || p.startsWith("/accueil/") },
  {
    href: R.chantiers,
    label: "Chantiers",
    icon: FolderKanban,
    match: (p: string) => p === "/chantiers" || p.startsWith("/chantiers/"),
  },
] as const;

const RIGHT = [
  {
    href: R.clientDevis,
    label: "Documents",
    icon: BookOpen,
    match: (p: string) =>
      p.startsWith("/client") || p.startsWith("/distributeur") || p.startsWith("/pieces/") || p.startsWith("/devis/"),
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
      p.startsWith("/parametres") ||
      p.startsWith("/entreprise") ||
      p.startsWith("/abonnement") ||
      p.startsWith("/compte"),
  },
] as const;

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
        "relative flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 text-[10px] font-medium leading-none tracking-[-0.01em] transition-colors duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-[0.98] motion-reduce:transition-none",
        on ? "text-white" : "text-white/55 hover:text-white/85",
      )}
    >
      <Icon className="size-[20px]" strokeWidth={on ? 2.1 : 1.7} aria-hidden />
      <span className="truncate">{label}</span>
      {on ? (
        <span className="absolute bottom-2 size-1 rounded-full bg-[#FF6B1A]" aria-hidden />
      ) : null}
    </Link>
  );
}

function MobileDevisButton({
  onShortTap,
  onLongPress,
  active,
}: {
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
      size="icon"
      title="Nouveau devis"
      aria-label="Nouveau devis"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerCancel}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        // Aligné au centre du puits, même ligne que les autres onglets
        "absolute top-1/2 left-1/2 z-10 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full",
        "touch-manipulation select-none",
        "focus-visible:border-tarineo-orange/40 focus-visible:ring-tarineo-orange/30",
        active && "ring-2 ring-tarineo-orange/40",
      )}
      style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }}
    >
      <svg
        className="pointer-events-none absolute inset-0 size-full -rotate-90"
        viewBox="0 0 48 48"
        aria-hidden
      >
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="none"
          stroke="currentColor"
          className="text-white/90"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 22}
          strokeDashoffset={2 * Math.PI * 22 * (1 - (reduce ? 0 : progress))}
          style={{
            opacity: progress > 0.02 ? 1 : 0,
            transition: "stroke-dashoffset 75ms linear",
          }}
        />
      </svg>
      <Plus className="relative size-5 text-white" strokeWidth={2.4} aria-hidden />
    </Button>
  );
}

/**
 * Navbar mobile : Accueil · Chantiers · [Nouveau devis] · Documents · Outils.
 * Tap FAB (centré) → /devis/nouveau · appui long → mode vocal.
 */
export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const devisActive = pathname.startsWith("/devis/");

  return (
    <nav
      aria-label="Navigation principale"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="pointer-events-auto relative mx-3">
        <div
          className={cn(
            "relative flex h-[68px] items-stretch rounded-[24px] border border-white/[0.09] px-1.5",
            "bg-[#161616]/94 shadow-[0_12px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[24px]",
          )}
        >
          {SIDES.map((t) => (
            <NavSideItem key={t.href} {...t} on={t.match(pathname)} />
          ))}

          <div className="relative flex w-[76px] shrink-0 items-center justify-center" aria-hidden>
            <div
              className={cn(
                "absolute top-1/2 size-[52px] -translate-y-1/2 rounded-full",
                "bg-black/40 shadow-[inset_0_2px_8px_rgba(0,0,0,0.45)]",
                "ring-1 ring-white/[0.06]",
              )}
            />
          </div>

          {RIGHT.map((t) => (
            <NavSideItem key={t.href} {...t} on={t.match(pathname)} />
          ))}

          <MobileDevisButton
            active={devisActive}
            onShortTap={() => router.push(R.devisNouveau)}
            onLongPress={() => router.push(`${R.devisNouveau}?mode=voice`)}
          />
        </div>
      </div>
    </nav>
  );
}
