import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const landingButtonVariants = cva(
  "group/cta inline-flex min-h-11 shrink-0 touch-manipulation items-center justify-center gap-2 rounded-pill font-medium whitespace-nowrap outline-none select-none transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] active:transition-[transform] active:duration-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "btn-dark min-h-12 border border-transparent px-6 text-[15px]",
        orange: "btn-orange min-h-12 border border-transparent px-6 text-[15px] font-semibold",
        navOrange: "btn-orange min-h-10 border border-transparent px-4 text-[14px] font-semibold",
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
      className={cn(landingButtonVariants({ variant, fullWidth }), className)}
    >
      {children}
      {icon ? (
        <span className="grid size-7 place-items-center rounded-full bg-black/10 transition-transform duration-300 ease-out-soft group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-px">
          {icon}
        </span>
      ) : null}
    </Link>
  );
}

export { landingButtonVariants };
