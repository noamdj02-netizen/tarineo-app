"use client";

import {
  type Easing,
  motion,
  type Transition,
  useReducedMotion,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { MegaMenu } from "@/components/site/landing-v2/components/layout/header/mega-menu";
import {
  LANDING_NAV_LINKS,
  type NavLink,
  type NavMenu,
} from "@/components/site/landing-v2/components/layout/header/nav-data";
import { isBlogRoute, landingNavHref } from "@/lib/site/landing-nav";
import { cn } from "@/lib/utils";

type Direction = "ltr" | "rtl";

const SPRING_TEXT = {
  type: "spring",
  stiffness: 320,
  damping: 32,
  mass: 1.3,
} as const satisfies Transition;

const EASE_WIPE = {
  duration: 0.5,
  ease: [0.32, 0.72, 0, 1] as Easing,
} as const satisfies Transition;

type LandingHeaderNavProps = {
  onMenuOpenChange?: (open: boolean) => void;
};

function hasNavigableHref(href?: string): href is string {
  return Boolean(href && href !== "#");
}

export function LandingHeaderNav({ onMenuOpenChange }: LandingHeaderNavProps) {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<NavMenu | null>(null);
  const [direction, setDirection] = useState<Direction>("ltr");
  const [shellEl, setShellEl] = useState<HTMLElement | null>(null);
  const activeIndexRef = useRef(-1);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktopItemRefs = useRef<Array<HTMLElement | null>>([]);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  const closeDesktopMenu = useCallback(() => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    setActiveMenu(null);
    activeIndexRef.current = -1;
  }, []);

  const openMenu = useCallback((menu: NavMenu, index: number) => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    if (activeIndexRef.current !== -1 && index !== activeIndexRef.current) {
      setDirection(index > activeIndexRef.current ? "rtl" : "ltr");
    }
    activeIndexRef.current = index;
    setActiveMenu(menu);
  }, []);

  const scheduleClose = useCallback(() => {
    leaveTimerRef.current = setTimeout(() => {
      closeDesktopMenu();
    }, 120);
  }, [closeDesktopMenu]);

  const cancelClose = useCallback(() => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
  }, []);

  useEffect(() => {
    const shell = document.querySelector<HTMLElement>("[data-landing-header-shell]");
    setShellEl(shell);
  }, []);

  useEffect(() => {
    onMenuOpenChange?.(!!activeMenu);
  }, [activeMenu, onMenuOpenChange]);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  const focusFirstMenuItem = useCallback(() => {
    megaMenuRef.current
      ?.querySelector<HTMLElement>('[data-mega-menu-item="true"]')
      ?.focus();
  }, []);

  const moveDesktopFocus = useCallback(
    (currentIndex: number, step: 1 | -1) => {
      const total = LANDING_NAV_LINKS.length;
      let nextIndex = currentIndex;
      for (let count = 0; count < total; count++) {
        nextIndex = (nextIndex + step + total) % total;
        const nextItem = desktopItemRefs.current[nextIndex];
        if (!nextItem) continue;
        nextItem.focus();
        const nextLink = LANDING_NAV_LINKS[nextIndex];
        if (nextLink?.menu) {
          cancelClose();
          openMenu(nextLink.menu, nextIndex);
        } else {
          closeDesktopMenu();
        }
        break;
      }
    },
    [cancelClose, closeDesktopMenu, openMenu],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>, link: NavLink, index: number) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveDesktopFocus(index, 1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveDesktopFocus(index, -1);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeDesktopMenu();
        desktopItemRefs.current[index]?.focus();
        return;
      }
      if (!link.menu) return;
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        cancelClose();
        openMenu(link.menu, index);
        requestAnimationFrame(() => focusFirstMenuItem());
      }
    },
    [cancelClose, closeDesktopMenu, focusFirstMenuItem, moveDesktopFocus, openMenu],
  );

  const mega =
    shellEl &&
    createPortal(
      <MegaMenu
        menu={activeMenu}
        direction={direction}
        panelRef={megaMenuRef}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        onEscape={() => {
          const activeIndex = activeIndexRef.current;
          closeDesktopMenu();
          if (activeIndex >= 0) desktopItemRefs.current[activeIndex]?.focus();
        }}
      />,
      shellEl,
    );

  return (
    <nav aria-label="Navigation principale" className="landing-header-nav">
      <ul className="flex min-h-10 items-center gap-0.5 md:gap-1">
        {LANDING_NAV_LINKS.map((link, linkIndex) => {
          const hasMenu = !!link.menu;
          const isOpen = hasMenu && activeMenu?.id === link.menu!.id;
          const href = hasNavigableHref(link.href)
            ? landingNavHref(link.href, pathname)
            : undefined;
          const active = link.href === "/blog" && isBlogRoute(pathname);

          return (
            <li
              key={link.label}
              className="relative"
              onMouseEnter={() => {
                if (hasMenu) {
                  cancelClose();
                  openMenu(link.menu!, linkIndex);
                } else {
                  scheduleClose();
                }
              }}
              onMouseLeave={scheduleClose}
            >
              {hasMenu ? (
                <button
                  ref={(node) => {
                    desktopItemRefs.current[linkIndex] = node;
                  }}
                  type="button"
                  onFocus={() => {
                    cancelClose();
                    openMenu(link.menu!, linkIndex);
                  }}
                  onKeyDown={(event) => handleKeyDown(event, link, linkIndex)}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-1 rounded-md px-2.5 py-2 text-sm font-semibold tracking-tight outline-none transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-0",
                    isOpen ? "text-accent-700" : "text-ink-700 hover:text-ink-900",
                  )}
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  aria-controls="desktop-mega-menu"
                >
                  {link.label}
                  <motion.span
                    className="inline-flex"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    aria-hidden
                  >
                    <ChevronDown className="size-3.5" strokeWidth={1.75} />
                  </motion.span>
                </button>
              ) : href ? (
                <FlipNavLink
                  ref={(node) => {
                    desktopItemRefs.current[linkIndex] = node;
                  }}
                  href={href}
                  label={link.label}
                  active={active}
                  onFocus={closeDesktopMenu}
                  onKeyDown={(event) => handleKeyDown(event, link, linkIndex)}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
      {mega}
    </nav>
  );
}

type FlipNavLinkProps = {
  href: string;
  label: string;
  active: boolean;
  onFocus: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
  ref?: React.Ref<HTMLAnchorElement>;
};

function FlipNavLink({
  href,
  label,
  active,
  onFocus,
  onKeyDown,
  ref,
}: FlipNavLinkProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <a
        ref={ref}
        href={href}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        aria-current={active ? "true" : undefined}
        className={cn(
          "inline-flex min-h-10 items-center rounded-md px-2.5 py-2 text-sm font-semibold tracking-tight outline-none",
          "focus-visible:ring-2 focus-visible:ring-accent/45",
          active ? "text-accent-700" : "text-ink-700 hover:text-ink-900",
        )}
      >
        {label}
      </a>
    );
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      aria-current={active ? "true" : undefined}
      className={cn(
        "relative inline-flex min-h-10 isolate overflow-clip rounded-md px-2.5 py-2 text-sm font-semibold tracking-tight outline-none",
        "focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-0",
        active ? "text-accent-700" : "text-ink-700",
      )}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      variants={{ initial: {}, hover: {} }}
    >
      <span className="invisible relative z-0" aria-hidden>
        {label}
      </span>

      <motion.span
        className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center"
        variants={{
          initial: { y: 0, scale: 1, rotate: 0 },
          hover: { y: "-120%", scale: 0.55, rotate: -28 },
        }}
        transition={SPRING_TEXT}
      >
        {label}
      </motion.span>

      <motion.span
        className="pointer-events-none absolute inset-0 z-[1] bg-accent will-change-transform"
        variants={{
          initial: { y: "125%", rotate: -36, opacity: 0 },
          hover: { y: 0, rotate: 0, opacity: 1 },
        }}
        transition={EASE_WIPE}
        aria-hidden
      >
        <motion.span
          className="absolute inset-0 bg-ink-900 will-change-transform"
          variants={{
            initial: { y: "145%", rotate: -52, opacity: 0 },
            hover: { y: 0, rotate: 0, opacity: 1 },
          }}
          transition={EASE_WIPE}
        />
      </motion.span>

      <motion.span
        className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center text-paper-0"
        variants={{
          initial: { y: "165%", rotate: -48, scale: 0.55, opacity: 0 },
          hover: { y: 0, rotate: 0, scale: 1, opacity: 1 },
        }}
        transition={SPRING_TEXT}
        aria-hidden
      >
        {label}
      </motion.span>
    </motion.a>
  );
}
