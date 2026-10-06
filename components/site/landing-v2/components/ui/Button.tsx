"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-center font-medium transition-colors duration-200 ease-out select-none";

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-[0.9375rem]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-[0_6px_16px_-10px_rgb(120_58_32/0.35)] hover:bg-accent-hover active:bg-accent-active",
  secondary:
    "bg-paper-0 text-ink-900 border border-line hover:border-line-strong hover:bg-paper-50 active:bg-paper-200",
  ghost: "text-ink-900 hover:text-accent-700",
};

function linkClass(size: Size, variant: Variant, className: string) {
  return `${base} ${sizes[size]} ${variants[variant]} ${className}`;
}

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const cls = linkClass(size, variant, className);

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  if (href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto")) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={cls}>
      {children}
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
