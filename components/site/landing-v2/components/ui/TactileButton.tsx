"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

export type TactileIndicatorColor = "accent" | "blue" | "green" | "amber" | "red" | "slate";

export interface TactileButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "ref"> {
  children?: React.ReactNode;
  /** Lien Next — rend un `<a>` tactile au lieu d’un `<button>`. */
  href?: string;
  showIndicator?: boolean;
  indicatorColor?: TactileIndicatorColor;
  size?: "sm" | "default" | "lg";
  fullWidth?: boolean;
  className?: string;
}

const MotionLink = motion.create(Link);

const springTransition = {
  type: "spring" as const,
  bounce: 0.45,
  duration: 0.55,
};

const INDICATOR_ON: Record<TactileIndicatorColor, string> = {
  accent: "rgb(247, 86, 44)",
  blue: "rgb(0, 102, 255)",
  green: "rgb(16, 185, 129)",
  amber: "rgb(245, 158, 11)",
  red: "rgb(239, 68, 68)",
  slate: "rgb(145, 173, 255)",
};

const INDICATOR_GLOW: Record<TactileIndicatorColor, string> = {
  accent:
    "0px 2px 2px 0px rgba(255, 255, 255, 0.9), inset 0px 1px 2px 0px rgba(0, 0, 0, 0.1), 0px 0px 10px 2px rgba(247, 86, 44, 0.75), 0px 0px 20px 4px rgba(247, 86, 44, 0.35)",
  blue: "0px 2px 2px 0px rgba(255, 255, 255, 0.9), inset 0px 1px 2px 0px rgba(0, 0, 0, 0.1), 0px 0px 10px 2px rgba(0, 102, 255, 0.8), 0px 0px 20px 4px rgba(59, 130, 246, 0.4)",
  green:
    "0px 2px 2px 0px rgba(255, 255, 255, 0.9), inset 0px 1px 2px 0px rgba(0, 0, 0, 0.1), 0px 0px 10px 2px rgba(16, 185, 129, 0.8), 0px 0px 20px 4px rgba(16, 185, 129, 0.4)",
  amber:
    "0px 2px 2px 0px rgba(255, 255, 255, 0.9), inset 0px 1px 2px 0px rgba(0, 0, 0, 0.1), 0px 0px 10px 2px rgba(245, 158, 11, 0.8), 0px 0px 20px 4px rgba(245, 158, 11, 0.4)",
  red: "0px 2px 2px 0px rgba(255, 255, 255, 0.9), inset 0px 1px 2px 0px rgba(0, 0, 0, 0.1), 0px 0px 10px 2px rgba(239, 68, 68, 0.8), 0px 0px 20px 4px rgba(239, 68, 68, 0.4)",
  slate:
    "0px 2px 2px 0px rgba(255, 255, 255, 0.9), inset 0px 1px 2px 0px rgba(0, 0, 0, 0.1), 0px 0px 10px 2px rgba(145, 173, 255, 0.8), 0px 0px 20px 4px rgba(145, 173, 255, 0.4)",
};

const SIZE = {
  sm: {
    container: "min-h-11 min-w-[130px]",
    base: "inset-[3px] rounded-[13px]",
    box: "gap-2 rounded-[12px] px-3.5 py-1.5 text-sm sm:text-base",
    indicator: "size-2.5",
    text: "text-sm leading-tight sm:text-base",
    pressedY: -8,
    pressedX: 2,
    rotate: -7.5,
  },
  default: {
    container: "min-h-[52px] min-w-[150px] sm:min-h-[60px] sm:min-w-[176px]",
    base: "inset-[4px] rounded-[15px]",
    box: "gap-2.5 rounded-[15px] px-4 pb-2.5 pt-1.5 text-base sm:gap-3 sm:px-[22px] sm:pb-[13px] sm:pt-[7px] sm:text-[19px] md:text-[20px]",
    indicator: "size-2.5 sm:size-3",
    text: "text-base leading-snug sm:text-[19px] sm:leading-[31px] md:text-[20px]",
    pressedY: -12,
    pressedX: 3,
    rotate: -8.5,
  },
  lg: {
    container: "min-h-[60px] min-w-[180px] sm:min-h-[72px] sm:min-w-[210px]",
    base: "inset-[5px] rounded-[18px]",
    box: "gap-3 rounded-[17px] px-5 pb-3 pt-2 text-lg sm:gap-3.5 sm:px-7 sm:pb-4 sm:pt-3 sm:text-[22px] md:text-[24px]",
    indicator: "size-3 sm:size-3.5",
    text: "text-lg leading-snug sm:text-[22px] sm:leading-[36px] md:text-[24px]",
    pressedY: -15,
    pressedX: 4,
    rotate: -8.8,
  },
} as const;

/**
 * Bouton tactile 3D (liquid glass) — CTA marketing landing.
 * Spring rocker ; `href` pour navigation Next.
 */
export const TactileButton = React.forwardRef<HTMLButtonElement, TactileButtonProps>(
  (
    {
      className,
      children = "Essayer",
      href,
      showIndicator = true,
      indicatorColor = "accent",
      size = "default",
      fullWidth = false,
      onClick,
      ...props
    },
    ref,
  ) => {
    const reduce = useReducedMotion();
    const [isPressed, setIsPressed] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const sizeConfig = SIZE[size];
    const transition = reduce ? { duration: 0 } : springTransition;
    const lit = isPressed || isHovered;

    const pressHandlers = {
      onMouseDown: () => setIsPressed(true),
      onMouseUp: () => setIsPressed(false),
      onMouseLeave: () => {
        setIsPressed(false);
        setIsHovered(false);
      },
      onTouchStart: () => setIsPressed(true),
      onTouchEnd: () => setIsPressed(false),
      onTouchCancel: () => setIsPressed(false),
      onHoverStart: () => setIsHovered(true),
      onHoverEnd: () => setIsHovered(false),
    };

    const plungerAnimate = reduce
      ? { rotate: 0, y: 0, x: 0 }
      : {
          rotate: isPressed ? sizeConfig.rotate : 0,
          y: isPressed ? sizeConfig.pressedY : isHovered ? -2 : 0,
          x: isPressed ? sizeConfig.pressedX : 0,
          boxShadow: isPressed
            ? "rgba(0, 0, 0, 0.22) -2px -6px 1px 0px inset, rgba(255, 255, 255, 0.9) 0.5px 1.5px 2px 0px inset, rgba(0, 0, 0, 0.15) 0px -1px 1px 0px inset, rgba(0, 0, 0, 0.12) 9px 10px 13px 0px, rgba(0, 0, 0, 0.04) 35px 38px 21px 0px, rgba(255, 255, 255, 0.6) 0px 1px 0px 0px inset"
            : isHovered
              ? "rgba(0, 0, 0, 0.20) -2px -7px 1px 0px inset, rgba(255, 255, 255, 0.95) 0.5px 2px 2px 0px inset, rgba(0, 0, 0, 0.15) 0px -1px 1px 0px inset, rgba(0, 0, 0, 0.12) 2px 3px 8px 0px, rgba(0, 0, 0, 0.10) 9px 12px 15px 0px, rgba(0, 0, 0, 0.06) 20px 24px 20px 0px, rgba(0, 0, 0, 0.02) 35px 38px 22px 0px, rgba(255, 255, 255, 0.7) 0px 1px 0px 0px inset"
              : "rgba(0, 0, 0, 0.20) -2px -6px 1px 0px inset, rgba(255, 255, 255, 0.9) 0.5px 1.5px 1px 0px inset, rgba(0, 0, 0, 0.15) 0px -1px 1px 0px inset, rgba(0, 0, 0, 0.10) 2px 2px 7px 0px, rgba(0, 0, 0, 0.09) 9px 10px 13px 0px, rgba(0, 0, 0, 0.05) 20px 22px 18px 0px, rgba(0, 0, 0, 0.01) 35px 38px 21px 0px, rgba(0, 0, 0, 0) 55px 60px 23px 0px, rgba(255, 255, 255, 0.5) 0px 1px 0px 0px inset",
        };

    const plungerClass = cn(
      "relative z-10 flex items-center justify-center overflow-hidden outline-none",
      "cursor-pointer border border-white/60 bg-gradient-to-b from-white/95 via-white/85 to-white/90 backdrop-blur-xl",
      "focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f2f2f2]",
      fullWidth ? "w-full" : "w-auto",
      sizeConfig.box,
    );

    const inner = (
      <>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-t-[14px] bg-gradient-to-b from-white/70 via-white/20 to-transparent"
        />
        {showIndicator ? (
          <motion.span
            aria-hidden="true"
            className={cn("relative z-10 shrink-0 rounded-full", sizeConfig.indicator)}
            initial={false}
            animate={{
              backgroundColor: lit ? INDICATOR_ON[indicatorColor] : "rgb(209, 215, 222)",
              boxShadow: lit
                ? INDICATOR_GLOW[indicatorColor]
                : "0px 2px 2px 0px rgb(255, 255, 255), inset 0px 1px 2px 0px rgba(0, 0, 0, 0.08), 0px -1px 1px 0px rgba(0, 0, 0, 0.1)",
            }}
            transition={transition}
          >
            <span
              aria-hidden="true"
              className="absolute top-px left-[1.5px] size-0.5 rounded-full bg-white/95 sm:size-[3px]"
            />
          </motion.span>
        ) : null}
        <span
          className={cn(
            "relative z-10 whitespace-nowrap font-medium tracking-normal text-[#292929]",
            sizeConfig.text,
          )}
        >
          {children}
        </span>
      </>
    );

    return (
      <div
        className={cn(
          "relative inline-flex touch-manipulation cursor-pointer items-center justify-center overflow-visible select-none",
          fullWidth ? "w-full" : "w-auto max-w-full",
          sizeConfig.container,
          className,
        )}
      >
        <motion.div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute bg-[#cbcbcb]/90 backdrop-blur-md transition-shadow",
            sizeConfig.base,
          )}
          initial={false}
          animate={{
            boxShadow: isPressed
              ? "inset 0px 1px 3px 0px rgba(0, 0, 0, 0.38), inset 4px 7px 6px 0px rgba(0, 0, 0, 0.28), inset -1px -1px 2px 0px rgba(255, 255, 255, 0.4)"
              : "inset 0px 1px 2px 0px rgba(0, 0, 0, 0.25), inset -1px -1px 2px 0px rgba(255, 255, 255, 0.3)",
          }}
          transition={transition}
        />

        {href ? (
          <MotionLink
            href={href}
            className={plungerClass}
            initial={false}
            animate={plungerAnimate}
            transition={transition}
            onClick={onClick as never}
            {...pressHandlers}
          >
            {inner}
          </MotionLink>
        ) : (
          <motion.button
            ref={ref}
            type="button"
            className={plungerClass}
            initial={false}
            animate={plungerAnimate}
            transition={transition}
            onClick={onClick}
            {...pressHandlers}
            {...props}
          >
            {inner}
          </motion.button>
        )}
      </div>
    );
  },
);

TactileButton.displayName = "TactileButton";
