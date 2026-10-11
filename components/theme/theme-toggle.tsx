"use client";

import { type ChangeEvent, useEffect, useState } from "react";

import { useTheme } from "@/components/theme/theme-provider";
import { useMounted } from "@/lib/hooks/use-mounted";
import { cn } from "@/lib/utils";

/**
 * Toggle clair / sombre — style rocker skeuomorphique.
 * Actif (sombre) = orange Tarineo, jamais bleu.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, setTheme } = useTheme();
  const mounted = useMounted();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(resolved === "dark");
  }, [resolved]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.checked;
    setChecked(next);
    setTheme(next ? "dark" : "light");
  };

  const dark = mounted ? checked : false;

  const toggleWrapperClassName = dark
    ? "bg-gradient-to-b from-[#111827] to-[#273244] shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_1px_1px_rgb(0_0_0/0.5)]"
    : "bg-gradient-to-b from-[#d5d5d5] to-[#e8e8e8] shadow-[0_1px_1px_rgb(255_255_255/0.6)]";

  const containerClassName = dark
    ? "bg-[#f7562c] shadow-[inset_0_0_0.0625em_0.125em_rgb(255_255_255/0.18),inset_0_0.0625em_0.125em_rgb(0_0_0/0.28)]"
    : "bg-[#e8e8e8] shadow-[inset_0_0_0.0625em_0.125em_rgb(255_255_255/0.2),inset_0_0.0625em_0.125em_rgb(0_0_0/0.4)]";

  const buttonClassName = dark
    ? "translate-x-[1.5em] bg-[#fff4f0] shadow-[inset_0_-0.0625em_0.0625em_0.125em_rgb(0_0_0/0.12),inset_0_-0.125em_0.0625em_rgb(0_0_0/0.18),inset_0_0.1875em_0.0625em_rgb(255_255_255/0.55),0_0.125em_0.125em_rgb(0_0_0/0.35)]"
    : "translate-x-0 bg-[#e8e8e8] shadow-[inset_0_-0.0625em_0.0625em_0.125em_rgb(0_0_0/0.1),inset_0_-0.125em_0.0625em_rgb(0_0_0/0.2),inset_0_0.1875em_0.0625em_rgb(255_255_255/0.3),0_0.125em_0.125em_rgb(0_0_0/0.5)]";

  const circleClassName = dark
    ? "bg-[radial-gradient(circle_at_50%_0,#fff7f4,#f7562c)]"
    : "bg-[radial-gradient(circle_at_50%_0,#f5f5f5,#c4c4c4)]";

  return (
    <div
      className={cn(
        "relative flex size-11 shrink-0 items-center justify-center rounded-[0.5em] p-[0.125em] text-[18px]",
        toggleWrapperClassName,
        className,
      )}
    >
      <input
        aria-label={dark ? "Passer en mode clair" : "Passer en mode sombre"}
        checked={dark}
        className="absolute inset-0 z-[1] h-full w-full cursor-pointer appearance-none rounded-[inherit] opacity-0"
        onChange={handleChange}
        type="checkbox"
        role="switch"
        aria-checked={dark}
      />
      <div
        className={cn(
          "relative flex h-[1.5em] w-[3em] items-center rounded-[0.375em] transition-[background-color] duration-[400ms] ease-linear motion-reduce:duration-[120ms]",
          containerClassName,
        )}
      >
        <div
          className={cn(
            "absolute left-[0.0625em] flex h-[1.375em] w-[1.375em] items-center justify-center rounded-[0.3125em] transition-transform duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)] [will-change:transform] motion-reduce:duration-[120ms]",
            buttonClassName,
          )}
          data-toggle-button
          aria-hidden
        >
          <div className="absolute mx-auto grid grid-cols-[repeat(3,min-content)] gap-[0.125em]">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                className={cn("size-[0.125em] rounded-full", circleClassName)}
                key={index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
