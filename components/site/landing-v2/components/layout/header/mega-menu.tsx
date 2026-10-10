"use client";

import { AnimatePresence, motion, type Transition } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import type { NavColumn, NavMenu } from "@/components/site/landing-v2/components/layout/header/nav-data";
import { cn } from "@/lib/utils";

type Direction = "ltr" | "rtl";

type MegaMenuProps = {
  menu: NavMenu | null;
  direction: Direction;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  panelRef?: React.RefObject<HTMLDivElement | null>;
  onEscape?: () => void;
};

const SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];
const STAGGER_STEP = 0.038;
const ITEM_X = 14;
const CONTENT_X = 64;

function hasNavigableHref(href?: string): href is string {
  return Boolean(href && href !== "#");
}

const contentVariants = {
  enter: (direction: Direction) => ({
    opacity: 0,
    x: direction === "rtl" ? CONTENT_X : -CONTENT_X,
  }),
  center: { opacity: 1, x: 0 },
  exit: (direction: Direction) => ({
    opacity: 0,
    x: direction === "rtl" ? -CONTENT_X : CONTENT_X,
  }),
};

function flatIndex(colIdx: number, rowIdx: number, columns: NavColumn[]): number {
  const before = columns.slice(0, colIdx).reduce((sum, col) => sum + 1 + col.items.length, 0);
  return before + rowIdx + 1;
}

function itemDelay(
  colIdx: number,
  rowIdx: number,
  columns: NavColumn[],
  direction: Direction,
): number {
  const total = columns.reduce((sum, col) => sum + 1 + col.items.length, 0);
  let flat = flatIndex(colIdx, rowIdx, columns);
  if (direction === "rtl") flat = total - 1 - flat;
  return Math.max(0, flat) * STAGGER_STEP;
}

function itemInitial(direction: Direction) {
  return { opacity: 0, x: direction === "rtl" ? ITEM_X : -ITEM_X, y: 4 };
}

function itemTransition(
  colIdx: number,
  rowIdx: number,
  columns: NavColumn[],
  direction: Direction,
): Transition {
  return {
    duration: 0.18,
    ease: "easeOut",
    delay: itemDelay(colIdx, rowIdx, columns, direction),
  };
}

function MegaMenuPanel({
  menu,
  direction,
  onMouseEnter,
  onMouseLeave,
  panelRef,
  onEscape,
}: MegaMenuProps & { menu: NavMenu }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const initial = itemInitial(direction);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      id="desktop-mega-menu"
      ref={panelRef}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height }}
      exit={{ opacity: 0, height: 0 }}
      transition={{
        height: { duration: 0.28, ease: SPRING },
        opacity: { duration: 0.18, ease: "easeOut" },
      }}
      className="absolute -right-px -left-px top-[calc(100%-1px)] z-50 overflow-hidden rounded-b-2xl border border-t-0 border-line bg-paper-0 shadow-float"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onEscape?.();
        }
      }}
    >
      <div ref={bodyRef}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={menu.id}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { duration: 0.26, ease: SPRING },
              opacity: { duration: 0.16, ease: "easeOut" },
            }}
            className="flex w-full"
          >
            {menu.columns.map((column, colIdx) => (
              <div
                key={column.heading}
                className={cn(
                  "flex-1 px-6 py-7 sm:px-8",
                  column.accent ? "bg-accent-soft/40" : "bg-paper-0",
                  colIdx !== 0 && "border-l border-line",
                )}
              >
                <motion.p
                  initial={initial}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={itemTransition(colIdx, -1, menu.columns, direction)}
                  className="mb-4 select-none text-[11px] font-semibold tracking-[0.14em] text-ink-400 uppercase"
                >
                  {column.heading}
                </motion.p>

                <div className="flex flex-col gap-y-4">
                  {column.items.map((item, rowIdx) =>
                    hasNavigableHref(item.href) ? (
                      <motion.a
                        key={item.label}
                        href={item.href}
                        initial={initial}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={itemTransition(colIdx, rowIdx, menu.columns, direction)}
                        className="group block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                        data-mega-menu-item="true"
                      >
                        <span className="block text-sm font-semibold leading-snug text-ink-900 transition-colors duration-150 group-hover:text-accent-700">
                          {item.label}
                        </span>
                        {item.description ? (
                          <span className="mt-0.5 block text-xs leading-snug text-ink-400">
                            {item.description}
                          </span>
                        ) : null}
                      </motion.a>
                    ) : (
                      <motion.span
                        key={item.label}
                        initial={initial}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={itemTransition(colIdx, rowIdx, menu.columns, direction)}
                        className="block text-sm font-semibold text-ink-900"
                      >
                        {item.label}
                      </motion.span>
                    ),
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function MegaMenu(props: MegaMenuProps) {
  return (
    <AnimatePresence>
      {props.menu ? <MegaMenuPanel key="mega-menu-panel" {...props} menu={props.menu} /> : null}
    </AnimatePresence>
  );
}
