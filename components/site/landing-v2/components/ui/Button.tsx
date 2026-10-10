"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex touch-manipulation items-center justify-center gap-2 rounded-full text-center font-medium",
    "transition-[color,background-color,border-color,transform] duration-150 ease-out select-none outline-none",
    "focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-100",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "[-webkit-tap-highlight-color:transparent]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-white hover:bg-accent-hover active:scale-[0.96] active:bg-accent-active disabled:active:scale-100",
        /** Launch UI — CTA ink (noir chaud) */
        ink: "rounded-md bg-ink-900 text-paper-0 shadow-sm hover:bg-ink-700 active:scale-[0.96] disabled:active:scale-100",
        secondary:
          "border border-ink-900/20 bg-gradient-to-t from-ink-900/5 to-ink-900/10 text-ink-900 hover:border-ink-900/30 active:scale-[0.96] disabled:active:scale-100",
        ghost: "text-ink-700 hover:bg-paper-0/50 hover:text-accent-700 active:scale-[0.96] disabled:active:scale-100",
      },
      size: {
        /** Barre de navigation — compact, aligné au header */
        sm: "h-9 px-3.5 text-[13px] leading-tight sm:h-10 sm:px-4 sm:text-sm",
        md: "h-11 px-5 text-sm leading-tight",
        lg: "h-12 px-6 text-[0.9375rem] leading-tight",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonBaseProps = VariantProps<typeof buttonVariants> & {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
};

type ButtonAsLink = ButtonBaseProps & {
  href: string;
};

type ButtonAsNative = ButtonBaseProps & {
  href?: undefined;
  type?: "button" | "submit";
};

export type LandingButtonProps = ButtonAsLink | ButtonAsNative;

function ButtonSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function Button(props: LandingButtonProps) {
  const {
    children,
    variant,
    size,
    className,
    disabled = false,
    loading = false,
    onClick,
  } = props;

  const cls = cn(buttonVariants({ variant, size }), className);
  const busy = disabled || loading;

  const inner = loading ? (
    <>
      <ButtonSpinner className="size-4" />
      <span>{children}</span>
    </>
  ) : (
    children
  );

  if (props.href !== undefined) {
    const { href } = props;
    if (busy) {
      return (
        <span className={cn(cls, "pointer-events-none opacity-50")} aria-disabled="true">
          {inner}
        </span>
      );
    }

    if (href.startsWith("/")) {
      return (
        <Link href={href} className={cls} onClick={onClick}>
          {inner}
        </Link>
      );
    }

    const external = href.startsWith("http");
    return (
      <a
        href={href}
        className={cls}
        onClick={onClick}
        rel={external ? "noopener noreferrer" : undefined}
        target={external ? "_blank" : undefined}
      >
        {inner}
      </a>
    );
  }

  const type = props.type ?? "button";
  return (
    <button
      type={type}
      className={cls}
      disabled={busy}
      aria-busy={loading || undefined}
      onClick={onClick}
    >
      {inner}
    </button>
  );
}

export function ArrowRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 10h11.5M11 5.5l4.5 4.5-4.5 4.5" />
    </svg>
  );
}

export { buttonVariants };
