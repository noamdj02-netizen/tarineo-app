"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bot,
  House,
  LayoutDashboard,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EASE } from "@/components/motion/reveal";
import { openAssistant } from "@/lib/assistant/open";
import { TABS, isActive } from "@/lib/nav";
import { cn } from "@/lib/utils";

const MAIN = [
  { href: "/accueil", label: "Accueil", icon: House },
  { href: "/projets", label: "Projets", icon: LayoutDashboard },
] as const;

const MORE = TABS.filter((t) => !MAIN.some((m) => m.href === t.href));

const ACTIONS = [
  { id: "plus", icon: "/figma/navbar/plus.svg", label: "Nouveau projet" },
  { id: "scan", icon: "/figma/navbar/scan.svg", label: "Rechercher" },
  { id: "send", icon: "/figma/navbar/send.svg", label: "Demander à l’IA" },
] as const;

type ActionId = (typeof ACTIONS)[number]["id"];

const CIRCLE_SHADOW =
  "shadow-[0_1px_1.5px_rgba(0,0,0,0.08),0_4px_6px_rgba(0,0,0,0.2)]";

function NavItem({
  label,
  icon: Icon,
  on,
  ...rest
}: {
  label: string;
  icon: LucideIcon;
  on: boolean;
} & (
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void; expanded: boolean }
)) {
  const cls = cn(
    "relative flex min-h-12 min-w-px flex-1 flex-col items-center justify-center gap-1 text-[10px] leading-none transition-colors duration-300",
    on ? "text-white" : "text-white/55 hover:text-white/80",
  );
  const body = (
    <>
      <Icon className="size-6" strokeWidth={1.6} aria-hidden />
      <span>{label}</span>
    </>
  );
  if ("href" in rest && rest.href) {
    return (
      <Link
        href={rest.href}
        aria-current={on ? "page" : undefined}
        className={cls}
      >
        {body}
      </Link>
    );
  }
  const { onClick, expanded } = rest as {
    onClick: () => void;
    expanded: boolean;
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className={cls}
    >
      {body}
    </button>
  );
}

/** Mobile : barre sombre à encoche (Figma « Navbar 25 ») + bouton flottant qui déplie 3 raccourcis. */
export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [panel, setPanel] = useState<"none" | "actions" | "more">("none");

  useEffect(() => setPanel("none"), [pathname]);

  useEffect(() => {
    if (panel === "none") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel("none");
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel]);

  function run(id: ActionId) {
    setPanel("none");
    if (id === "plus") {
      if (isActive(pathname, "/projets"))
        window.dispatchEvent(new Event("navpit:new-project"));
      else router.push("/projets#nouveau");
    } else if (id === "scan") window.dispatchEvent(new Event("navpit:search"));
    else openAssistant();
  }

  const moreOn = MORE.some((t) => isActive(pathname, t.href));

  return (
    <>
      <AnimatePresence>
        {panel !== "none" ? (
          <motion.button
            key="scrim"
            type="button"
            aria-label="Fermer"
            onClick={() => setPanel("none")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-ink/25 backdrop-blur-[2px] lg:hidden"
          />
        ) : null}
      </AnimatePresence>

      <nav
        aria-label="Navigation principale"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
        }}
      >
        <div className="relative mx-auto w-full max-w-[420px] px-2">
          {/* autres sections */}
          <AnimatePresence>
            {panel === "more" ? (
              <motion.ul
                key="more"
                initial={
                  reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }
                }
                transition={{ duration: 0.3, ease: EASE }}
                className={cn(
                  "pointer-events-auto absolute inset-x-2 bottom-[calc(100%+48px)] grid origin-bottom grid-cols-4 gap-1 rounded-[20px] bg-nav p-2 text-white",
                  CIRCLE_SHADOW,
                )}
              >
                {MORE.map(({ href, short, icon: Icon }) => {
                  const on = isActive(pathname, href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={on ? "page" : undefined}
                        className={cn(
                          "flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl text-[10.5px] transition-colors",
                          on
                            ? "bg-white/12 text-white"
                            : "text-white/70 hover:bg-white/6 hover:text-white",
                        )}
                      >
                        <Icon
                          className="size-5"
                          strokeWidth={1.6}
                          aria-hidden
                        />
                        {short}
                      </Link>
                    </li>
                  );
                })}
              </motion.ul>
            ) : null}
          </AnimatePresence>

          <div className="pointer-events-auto relative">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-[65px] [filter:drop-shadow(0_6px_14px_rgba(0,0,0,0.18))]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- forme d'encoche Figma étirée à la largeur de la barre */}
              <img
                src="/figma/navbar/notch.svg"
                alt=""
                className="block size-full max-w-none"
              />
            </div>

            <div className="relative flex items-center justify-between px-[5px] pt-[10px] pb-[16px]">
              {MAIN.map((t) => (
                <NavItem key={t.href} {...t} on={isActive(pathname, t.href)} />
              ))}
              <div className="h-[46px] min-w-px flex-1" aria-hidden />
              <NavItem
                label="IA"
                icon={Bot}
                on={false}
                expanded={false}
                onClick={() => {
                  setPanel("none");
                  openAssistant();
                }}
              />
              <NavItem
                label="Plus"
                icon={LayoutGrid}
                on={moreOn || panel === "more"}
                expanded={panel === "more"}
                onClick={() =>
                  setPanel((p) => (p === "more" ? "none" : "more"))
                }
              />
            </div>

            {/* bouton flottant dans l'encoche */}
            <div className="absolute top-[-36px] left-1/2 flex -translate-x-1/2 flex-col items-center">
              <ul
                id="nav-actions"
                className="absolute bottom-[calc(100%+12px)] flex flex-col items-center gap-3"
                aria-label="Raccourcis"
              >
                <AnimatePresence>
                  {panel === "actions"
                    ? ACTIONS.map((a, i) => {
                        const k = ACTIONS.length - 1 - i;
                        return (
                          <motion.li
                            key={a.id}
                            initial={
                              reduce
                                ? { opacity: 0 }
                                : { opacity: 0, y: 24 + k * 20, scale: 0.6 }
                            }
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={
                              reduce
                                ? { opacity: 0 }
                                : { opacity: 0, y: 16 + k * 16, scale: 0.7 }
                            }
                            transition={{
                              duration: 0.32,
                              ease: EASE,
                              delay: reduce ? 0 : k * 0.04,
                            }}
                            className="relative"
                          >
                            <button
                              type="button"
                              onClick={() => run(a.id)}
                              aria-label={a.label}
                              className={cn(
                                "grid size-10 place-items-center rounded-[20px] bg-nav transition-transform duration-200 active:scale-95",
                                CIRCLE_SHADOW,
                              )}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element -- icône SVG Figma */}
                              <img
                                src={a.icon}
                                alt=""
                                width={18}
                                height={18}
                                className="block"
                              />
                            </button>
                            <span className="pointer-events-none absolute top-1/2 right-[calc(100%+10px)] -translate-y-1/2 rounded-pill bg-nav px-2.5 py-1 text-[12px] whitespace-nowrap text-white">
                              {a.label}
                            </span>
                          </motion.li>
                        );
                      })
                    : null}
                </AnimatePresence>
              </ul>

              <motion.button
                type="button"
                onClick={() =>
                  setPanel((p) => (p === "actions" ? "none" : "actions"))
                }
                aria-expanded={panel === "actions"}
                aria-controls="nav-actions"
                aria-label={
                  panel === "actions"
                    ? "Fermer les raccourcis"
                    : "Ouvrir les raccourcis"
                }
                whileTap={reduce ? undefined : { scale: 0.92 }}
                className={cn(
                  "grid size-[60px] place-items-center rounded-[30px] bg-nav",
                  CIRCLE_SHADOW,
                )}
              >
                <motion.span
                  animate={
                    reduce
                      ? undefined
                      : panel === "actions"
                        ? { rotate: -12, x: 2, y: -1 }
                        : { rotate: 0, x: 0, y: 0 }
                  }
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="block -scale-y-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- bonhomme Figma « 33-courir-urgent » */}
                  <img
                    src="/figma/navbar/fab-trait.svg"
                    alt=""
                    width={28}
                    height={20.8205}
                    className="block h-[20.821px] w-[28px]"
                  />
                </motion.span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
