"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMounted } from "@/lib/hooks/use-mounted";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";

const MOTION =
  "transition-[opacity,transform] duration-[180ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none motion-reduce:transform-none";

function labelFor(dark: boolean) {
  return dark ? "Passer en mode clair" : "Passer en mode sombre";
}

const BTN_CLASS = cn(
  "size-9 shrink-0 rounded-[10px] border border-line bg-transparent text-ink shadow-none",
  "hover:bg-[rgba(10,10,10,0.04)] hover:text-ink",
  "dark:border-[rgba(255,255,255,0.08)] dark:hover:bg-[rgba(255,255,255,0.06)]",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
);

function ThemeIcons() {
  return (
    <span className="relative block size-4">
      <Moon
        aria-hidden
        className={cn(
          "absolute inset-0 size-4 rotate-0 text-current opacity-100",
          "dark:rotate-180 dark:opacity-0",
          MOTION,
        )}
        strokeWidth={1.8}
      />
      <Sun
        aria-hidden
        className={cn(
          "absolute inset-0 size-4 -rotate-180 text-current opacity-0",
          "dark:rotate-0 dark:opacity-100",
          MOTION,
        )}
        strokeWidth={1.8}
      />
    </span>
  );
}

export function ThemeToggle() {
  const { setTheme } = useTheme();
  /** Tooltip (Base UI useId) seulement après mount → HTML SSR = premier paint client. */
  const mounted = useMounted();
  const [label, setLabel] = useState("Passer en mode sombre");

  useEffect(() => {
    setLabel(labelFor(document.documentElement.classList.contains("dark")));
  }, []);

  function onToggle() {
    const dark = document.documentElement.classList.contains("dark");
    setTheme(dark ? "light" : "dark");
    setLabel(labelFor(!dark));
  }

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label={label}
        onClick={onToggle}
        className={BTN_CLASS}
      >
        <ThemeIcons />
      </Button>
    );
  }

  return (
    <TooltipProvider delay={600}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              aria-label={label}
              onClick={onToggle}
              className={BTN_CLASS}
            />
          }
        >
          <ThemeIcons />
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
