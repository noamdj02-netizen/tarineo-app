import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const landingButtonVariants = cva(
  "group/cta inline-flex min-h-11 shrink-0 touch-manipulation items-center gap-3 rounded-full font-medium whitespace-nowrap outline-none select-none transition-[transform,box-shadow,background-color,border-color,color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "btn-dark min-h-12 border border-transparent px-6 text-[15px]",
        orange: "btn-orange min-h-12 border border-transparent text-[15px] font-semibold",
        navOrange: "btn-orange min-h-10 border border-transparent px-4 text-[14px] font-semibold",
        /** Pastille blanche posée sur le grand fond orange du hero. */
        heroOnOrange:
          "btn-on-orange min-h-[3.25rem] border border-transparent bg-white text-[15px] font-semibold text-[#9A3412] shadow-[0_2px_4px_rgba(74,22,2,0.16),0_20px_44px_-20px_rgba(74,22,2,0.6)] hover:-translate-y-0.5 focus-visible:ring-white/70 focus-visible:ring-offset-transparent",
        glass:
          "liquid-glass min-h-12 border border-white/20 px-6 text-[15px] text-white hover:bg-white hover:text-black",
        secondary:
          "min-h-12 border border-border bg-card px-6 text-[15px] text-foreground shadow-soft hover:bg-muted",
        inverse:
          "min-h-12 border border-transparent bg-accent-ink px-6 text-[15px] text-ink shadow-lift hover:-translate-y-0.5",
        navPrimary: "btn-dark min-h-10 border border-transparent px-4 text-[14px]",
        navGhost:
          "min-h-10 border border-transparent bg-transparent px-4 text-[14px] text-muted-foreground shadow-none hover:bg-muted hover:text-foreground",
        pricingOnDark:
          "mt-auto min-h-12 border border-transparent bg-accent-ink px-5 text-[15px] text-ink hover:-translate-y-0.5",
        pricingOnLight: "btn-dark mt-auto min-h-12 border border-transparent px-5 text-[15px]",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      fullWidth: false,
    },
  },
);

type LandingButtonProps = VariantProps<typeof landingButtonVariants> & {
  href: Route | string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  prefetch?: boolean;
};

/** CTA landing : Link + variantes, icône dans un disque (Figma). */
export function LandingButton({
  href,
  children,
  className,
  variant,
  fullWidth,
  icon,
  prefetch = true,
}: LandingButtonProps) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={cn(
        landingButtonVariants({ variant, fullWidth }),
        icon ? "justify-between pl-6 pr-2" : "justify-center px-6",
        className,
      )}
    >
      {children}
      {icon ? (
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-black/10 text-current transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-px group-hover/cta:scale-105 group-active/cta:scale-100 [.btn-on-orange_&]:bg-[#E2550E] [.btn-on-orange_&]:text-white [.btn-orange_&]:bg-white/22">
          {icon}
        </span>
      ) : null}
    </Link>
  );
}

export { landingButtonVariants };
