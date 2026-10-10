"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FolderTabCardProps = {
  title: string;
  subtitle: string;
  metricValue: string;
  metricLabel: string;
  meta: string;
  href?: string;
  eyebrow?: string;
  /** Aperçu / média dans la zone mesh (haut). */
  media?: ReactNode;
  footer?: ReactNode;
  /** Titre plus large (parcours landing). */
  wideTitle?: boolean;
  className?: string;
  onAction?: () => void;
};

/** Folder-tab + mesh orange Tarineo — chantiers & parcours landing. */
export function FolderTabCard({
  href,
  title,
  subtitle,
  metricValue,
  metricLabel,
  meta,
  eyebrow,
  media,
  footer,
  wideTitle,
  className,
  onAction,
}: FolderTabCardProps) {
  const reduce = useReducedMotion();
  const [isDark, setIsDark] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isCompact, setIsCompact] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const check = () =>
      setIsDark(root.classList.contains("dark") || root.dataset.theme === "dark");
    check();
    const observer = new MutationObserver(check);
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const apply = (w: number) => setIsCompact(w < 240);
    apply(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) apply(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const arrowClass = cn(
    "flex items-center justify-center rounded-full border backdrop-blur-xl shadow-sm transition-colors",
    isCompact ? "size-8" : "size-10",
    isDark
      ? "border-white/30 bg-white/25 text-white hover:bg-white/35"
      : "border-ink/10 bg-white/80 text-ink hover:bg-white",
  );

  return (
    <div
      ref={cardRef}
      onMouseMove={
        reduce
          ? undefined
          : (e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setMousePos({
                x: ((e.clientX - rect.left) / rect.width - 0.5) * 36,
                y: ((e.clientY - rect.top) / rect.height - 0.5) * 36,
              });
            }
      }
      onMouseLeave={reduce ? undefined : () => setMousePos({ x: 0, y: 0 })}
      className={cn(
        "relative aspect-[4/5] w-full max-h-[min(420px,100%)] overflow-hidden rounded-[28px] p-2 transition-[background-color,border-color] duration-300 sm:rounded-[32px] sm:p-2.5",
        isDark
          ? "border border-white/10 bg-[#14110e] shadow-[0_24px_50px_-12px_rgba(26,16,12,0.55)]"
          : "border border-ink/8 bg-white shadow-[0_20px_45px_-14px_rgba(26,16,12,0.14)]",
        className,
      )}
    >
      {/* outer 28/32 − pad 8/10 − border 1 → inner 19/21 → 20/22 */}
      <div className="relative h-full w-full overflow-hidden rounded-[20px] sm:rounded-[22px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className={cn(
              "absolute inset-0 transition-colors duration-500",
              isDark ? "bg-[#1a100c]" : "bg-[#fff5ef]",
            )}
          />
          <motion.div
            animate={
              reduce
                ? undefined
                : {
                    rotate: [0, 360],
                    x: mousePos.x,
                    y: mousePos.y,
                  }
            }
            transition={
              reduce
                ? undefined
                : {
                    rotate: { duration: 28, repeat: Infinity, ease: "linear" },
                    x: { type: "spring", stiffness: 120, damping: 18 },
                    y: { type: "spring", stiffness: 120, damping: 18 },
                  }
            }
            className="pointer-events-none absolute -top-[35%] -left-[35%] h-[170%] w-[170%]"
          >
            <motion.div
              animate={
                reduce
                  ? undefined
                  : {
                      x: [-40, 36, -28, -40],
                      y: [-28, 32, -36, -28],
                      scale: [1, 1.28, 0.92, 1],
                    }
              }
              transition={reduce ? undefined : { duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[18%] left-[12%] h-[70%] w-[70%] blur-[22px]"
              style={{
                background: isDark
                  ? "radial-gradient(circle, #ff8a4a 0%, #ff6b1a 42%, #8a3a12 78%, transparent 100%)"
                  : "radial-gradient(circle, #ffc9a8 0%, #ff8a4a 48%, #ff6b1a 82%, transparent 100%)",
              }}
            />
            <motion.div
              animate={
                reduce
                  ? undefined
                  : {
                      x: [32, -40, 28, 32],
                      y: [28, -32, 36, 28],
                      scale: [0.92, 1.35, 0.95, 0.92],
                    }
              }
              transition={reduce ? undefined : { duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[22%] left-[20%] h-[58%] w-[58%] blur-[16px]"
              style={{
                background: isDark
                  ? "radial-gradient(circle, #fff 0%, #ffe8d4 40%, #ff6b1a 72%, transparent 92%)"
                  : "radial-gradient(circle, #fff 0%, #fff8f3 45%, #ffd4b8 78%, transparent 95%)",
              }}
            />
            <motion.div
              animate={
                reduce
                  ? undefined
                  : {
                      x: [-32, 30, -20, -32],
                      y: [28, -30, 24, 28],
                      scale: [0.9, 1.25, 0.88, 0.9],
                    }
              }
              transition={reduce ? undefined : { duration: 7.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[8%] left-[8%] h-[50%] w-[50%] opacity-80 blur-[18px]"
              style={{
                background: isDark
                  ? "radial-gradient(circle, #fba27a 0%, #ffe8d4 50%, transparent 82%)"
                  : "radial-gradient(circle, #ffd8c2 0%, #fff5ef 55%, transparent 85%)",
              }}
            />
          </motion.div>
          <div
            className={cn(
              "pointer-events-none absolute inset-0",
              isDark
                ? "bg-gradient-to-t from-black/45 via-transparent to-transparent"
                : "bg-gradient-to-t from-white/25 via-transparent to-transparent",
            )}
          />
        </div>

        {media ? (
          <div className="pointer-events-none absolute inset-x-3 top-3 z-[5] max-h-[34%] overflow-hidden sm:inset-x-4 sm:top-4">
            {media}
          </div>
        ) : null}

        <div className={cn("absolute z-20", isCompact ? "top-2.5 right-2.5" : "top-3.5 right-3.5")}>
          <motion.div
            whileHover={reduce ? undefined : { scale: 1.08, rotate: 6 }}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {href ? (
              <Link href={href} aria-label={`Ouvrir ${title}`} className={arrowClass}>
                <ArrowUpRight className={isCompact ? "size-3.5" : "size-4"} strokeWidth={2} aria-hidden />
              </Link>
            ) : (
              <button
                type="button"
                onClick={onAction}
                aria-label={title}
                className={arrowClass}
              >
                <ArrowUpRight className={isCompact ? "size-3.5" : "size-4"} strokeWidth={2} aria-hidden />
              </button>
            )}
          </motion.div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end">
          <div className={cn("relative w-full", wideTitle ? "h-[62%]" : "h-[58%]")}>
            <svg
              viewBox="0 0 380 240"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full drop-shadow-[0_-10px_20px_rgba(26,16,12,0.12)]"
              aria-hidden
            >
              <path
                d="M 0 28
                   A 28 28 0 0 1 28 0
                   L 180 0
                   A 22 22 0 0 1 202 22
                   A 22 22 0 0 0 224 44
                   L 352 44
                   A 28 28 0 0 1 380 72
                   L 380 212
                   A 28 28 0 0 1 352 240
                   L 28 240
                   A 28 28 0 0 1 0 212
                   Z"
                fill={isDark ? "#1c1612" : "#FFFFFF"}
                stroke={isDark ? "rgba(255,255,255,0.09)" : "rgba(10,10,10,0.06)"}
                strokeWidth="1"
              />
            </svg>

            <div
              className={cn(
                "relative z-20 flex h-full w-full flex-col pointer-events-auto",
                wideTitle
                  ? isCompact
                    ? "gap-0 px-3.5 pb-3.5 pt-1.5"
                    : "gap-0 px-5 pb-4 pt-2.5"
                  : isCompact
                    ? "justify-between p-3"
                    : "justify-between p-4 sm:p-5",
              )}
            >
              {/* Titre dans l’onglet ; détail juste sous le cran ; métrique en bas */}
              <div className={cn(wideTitle ? "max-w-[47%]" : "max-w-[52%] pt-0.5")}>
                {eyebrow ? (
                  <p className="mono-label mb-1 text-[9px] !text-tarineo-orange">{eyebrow}</p>
                ) : null}
                <h3
                  className={cn(
                    "font-display font-semibold tracking-tight text-balance",
                    wideTitle
                      ? isCompact
                        ? "text-[15px] leading-[1.18]"
                        : "text-[17px] leading-[1.18] tracking-[-0.03em] sm:text-[18px]"
                      : isCompact
                        ? "text-[13px] leading-tight"
                        : "text-[15px] leading-tight sm:text-[17px]",
                    isDark ? "text-white" : "text-ink",
                  )}
                >
                  {href ? (
                    <Link href={href} className="relative z-10 outline-none hover:text-tarineo-orange">
                      {title}
                    </Link>
                  ) : (
                    title
                  )}
                </h3>
                {!wideTitle ? (
                  <p
                    className={cn(
                      "mt-0.5 line-clamp-2 font-medium",
                      isCompact ? "text-[9px] leading-snug" : "text-[10px] leading-snug sm:text-[11px]",
                      isDark ? "text-white/55" : "text-muted-foreground",
                    )}
                  >
                    {subtitle}
                  </p>
                ) : null}
              </div>

              {wideTitle ? (
                <p
                  className={cn(
                    "max-w-[96%] font-medium",
                    isCompact
                      ? "mt-5 text-[12px] leading-snug"
                      : "mt-6 text-[13px] leading-[1.35] sm:mt-7 sm:text-[14px]",
                    isDark ? "text-white/70" : "text-ink-600",
                  )}
                >
                  {subtitle}
                </p>
              ) : null}

              <div
                className={cn(
                  "relative z-10",
                  wideTitle ? "mt-auto pt-3" : "contents",
                )}
              >
                <div
                  className={cn(
                    "flex items-end justify-between gap-2",
                    !wideTitle && "pb-0.5",
                  )}
                >
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={cn(
                        "font-display font-bold tracking-tight leading-none tabular-nums",
                        wideTitle
                          ? "text-[1.35rem] sm:text-[1.5rem]"
                          : isCompact
                            ? "text-lg"
                            : "text-xl sm:text-2xl",
                        isDark ? "text-white" : "text-ink",
                      )}
                    >
                      {metricValue}
                    </span>
                    {metricLabel ? (
                      <span
                        className={cn(
                          "font-medium",
                          isCompact ? "text-[10px]" : "text-[12px]",
                          isDark ? "text-white/50" : "text-muted-foreground",
                        )}
                      >
                        {metricLabel}
                      </span>
                    ) : null}
                  </div>
                  {meta ? (
                    <div
                      className={cn(
                        "max-w-[45%] text-right font-medium leading-snug",
                        isCompact ? "text-[10px]" : "text-[12px]",
                        meta.toLowerCase().includes("relance")
                          ? "text-tarineo-orange"
                          : isDark
                            ? "text-white/50"
                            : "text-muted-foreground",
                      )}
                    >
                      {meta}
                    </div>
                  ) : null}
                </div>

                {footer ? <div className="relative z-10">{footer}</div> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
